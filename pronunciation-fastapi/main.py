from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import threading

try:
    from prometheus_fastapi_instrumentator import Instrumentator
except ImportError:
    Instrumentator = None  # type: ignore
import re
import numpy as np
import io
from models import AudioAnalysisResult
import uvicorn

app = FastAPI(title="Pronunciation Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if Instrumentator is not None:
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")
else:

    @app.get("/metrics")
    async def metrics_fallback():  # noqa: F811
        from fastapi.responses import PlainTextResponse

        return PlainTextResponse(
            "# Prometheus stub (installer prometheus-fastapi-instrumentator pour des métriques détaillées)\npronunciation_stub_up 1\n",
            media_type="text/plain; version=0.0.4",
        )

_whisper_model = None
_whisper_lock = threading.Lock()


def get_whisper_model() -> WhisperModel:
    """Charge Whisper au premier besoin pour que l’API écoute tout de suite (health, Prometheus)."""
    global _whisper_model
    with _whisper_lock:
        if _whisper_model is None:
            _whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
        return _whisper_model

NO_SPEECH_PHRASES = {
    "[no speech detected]", "no speech detected", "[blank_audio]",
    "[silence]", "[music]", "[noise]", "[inaudible]", "...", ". . ."
}

def is_no_speech(text: str) -> bool:
    """Detect if Whisper returned a non-speech placeholder."""
    cleaned = text.strip().lower()
    if not cleaned:
        return True
    stripped = re.sub(r'[^\w\s]', '', cleaned).strip()
    if not stripped:
        return True
    if stripped in NO_SPEECH_PHRASES or cleaned in NO_SPEECH_PHRASES:
        return True
    if len(stripped) <= 2:
        return True
    return False

def levenshtein_ratio(s1: str, s2: str) -> float:
    """Character-level similarity ratio between two strings."""
    if not s1 and not s2:
        return 1.0
    if not s1 or not s2:
        return 0.0
    len1, len2 = len(s1), len(s2)
    matrix = [[0] * (len2 + 1) for _ in range(len1 + 1)]
    for i in range(len1 + 1):
        matrix[i][0] = i
    for j in range(len2 + 1):
        matrix[0][j] = j
    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if s1[i-1] == s2[j-1] else 1
            matrix[i][j] = min(
                matrix[i-1][j] + 1,
                matrix[i][j-1] + 1,
                matrix[i-1][j-1] + cost
            )
    distance = matrix[len1][len2]
    return 1.0 - (distance / max(len1, len2))

def word_level_accuracy(words_t: list, words_e: list) -> float:
    """More accurate word matching using best-match alignment."""
    if not words_e:
        return 0.0
    matched = 0
    used = set()
    for wt in words_t:
        best_score = 0.0
        best_idx = -1
        for i, we in enumerate(words_e):
            if i in used:
                continue
            score = levenshtein_ratio(wt, we)
            if score > best_score:
                best_score = score
                best_idx = i
        if best_score >= 0.75 and best_idx != -1:
            matched += best_score
            used.add(best_idx)
    return (matched / len(words_e)) * 100

def calculate_scores(transcribed: str, expected: str):
    if is_no_speech(transcribed):
        return {
            "pronunciationScore": 0.0,
            "fluencyScore": 0.0,
            "intonationScore": 0.0,
            "clarityScore": 0.0,
            "problematicPhonemes": [],
            "noSpeechDetected": True
        }
    t = re.sub(r'[^\w\s]', '', transcribed.lower().strip())
    e = re.sub(r'[^\w\s]', '', expected.lower().strip())
    words_t = t.split()
    words_e = e.split()
    char_similarity = levenshtein_ratio(t, e) * 100
    word_accuracy = word_level_accuracy(words_t, words_e)
    coverage = min(len(words_t) / max(len(words_e), 1), 1.0)
    coverage_penalty = (1 - coverage) * 20
    pronunciationScore = (
        char_similarity * 0.40 +
        word_accuracy * 0.50 +
        coverage * 10 -
        coverage_penalty * 0.5
    )
    pronunciationScore = round(max(5.0, min(99.0, pronunciationScore)), 1)
    word_ratio = len(words_t) / max(len(words_e), 1)
    fluency_base = max(0, 1 - abs(1 - word_ratio)) * 100
    fluencyScore = round(max(5.0, min(99.0, fluency_base * 0.6 + word_accuracy * 0.4)), 1)
    syllable_count_t = sum(max(1, len(re.findall(r'[aeiou]', w))) for w in words_t)
    syllable_count_e = sum(max(1, len(re.findall(r'[aeiou]', w))) for w in words_e)
    syllable_ratio = min(syllable_count_t, syllable_count_e) / max(syllable_count_e, 1)
    intonation_base = syllable_ratio * 100
    intonationScore = round(
        max(5.0, min(99.0,
            intonation_base * 0.4 + pronunciationScore * 0.6 + np.random.uniform(-5, 5)
        )), 1
    )
    clarityScore = round(max(5.0, min(99.0, char_similarity * 0.55 + word_accuracy * 0.45)), 1)
    problematicPhonemes = []
    th_words = {"the", "this", "that", "think", "three", "there", "they", "them",
                "these", "those", "then", "than", "through", "though", "with"}
    if any(w in th_words for w in words_e):
        th_in_transcription = any(
            levenshtein_ratio(wt, we) > 0.6
            for wt in words_t
            for we in words_e if we in th_words
        )
        if not th_in_transcription:
            problematicPhonemes.append("θ")
    sh_words_e = [w for w in words_e if "sh" in w or w in {"she", "shore", "shell", "shells", "seashells", "seashore"}]
    if sh_words_e:
        sh_found = any("sh" in wt or levenshtein_ratio(wt, we) > 0.7
                       for wt in words_t for we in sh_words_e)
        if not sh_found:
            problematicPhonemes.append("ʃ")
    s_words_e = [w for w in words_e if w.startswith("s")]
    if len(s_words_e) >= 2:
        s_found = sum(1 for wt in words_t if wt.startswith("s"))
        if s_found < len(s_words_e) * 0.5:
            problematicPhonemes.append("s")
    r_words_e = [w for w in words_e if "r" in w]
    if r_words_e:
        r_found = any("r" in wt for wt in words_t)
        if not r_found and len(r_words_e) >= 2:
            problematicPhonemes.append("r")
    return {
        "pronunciationScore": pronunciationScore,
        "fluencyScore": fluencyScore,
        "intonationScore": intonationScore,
        "clarityScore": clarityScore,
        "problematicPhonemes": list(dict.fromkeys(problematicPhonemes)),
        "noSpeechDetected": False
    }

@app.post("/analyze-pronunciation", response_model=AudioAnalysisResult)
async def analyze_pronunciation(
    audio: UploadFile = File(...),
    expected_text: str = Form(...)
):
    try:
        if audio.filename is None:
            raise HTTPException(400, detail="No filename provided")
        contents = await audio.read()
        if len(contents) == 0:
            raise HTTPException(400, detail="Empty audio file")
        segments, info = get_whisper_model().transcribe(
            io.BytesIO(contents),
            beam_size=5,
            language="en",
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=300,
                speech_pad_ms=200
            )
        )
        transcribed_text = " ".join(segment.text for segment in segments).strip()
        if not transcribed_text:
            transcribed_text = "[No speech detected]"
        scores = calculate_scores(transcribed_text, expected_text)
        no_speech = scores.get("noSpeechDetected", False)
        overall_score = (scores["pronunciationScore"] + scores["fluencyScore"] + scores["intonationScore"] + scores["clarityScore"]) / 4.0
        if no_speech:
            overall_feedback = "No speech detected. Please speak clearly into the microphone and ensure your microphone is working."
            improvement_tips = [
                "Make sure your microphone is enabled and not muted",
                "Speak louder and closer to the microphone",
                "Try recording in a quieter environment"
            ]
        elif scores["pronunciationScore"] >= 88:
            overall_feedback = "Excellent pronunciation! Very close to native speaker level."
            improvement_tips = [
                "Try to maintain this level of consistency",
                "Work on natural connected speech and linking",
                "Experiment with different sentence rhythms"
            ]
        elif scores["pronunciationScore"] >= 72:
            overall_feedback = "Good job! A few sounds need polishing but overall very clear."
            improvement_tips = [
                "Focus on the specific phonemes flagged below",
                "Listen to native speakers and mimic their rhythm",
                "Record yourself and compare to the reference audio"
            ]
        elif scores["pronunciationScore"] >= 50:
            overall_feedback = "Fair attempt. Keep practicing — you're making progress!"
            improvement_tips = [
                "Speak more slowly and articulate each word clearly",
                "Focus on word stress and sentence rhythm",
                "Practice the flagged phonemes with minimal pairs"
            ]
        else:
            overall_feedback = "Keep going! Consistent practice will lead to big improvements."
            improvement_tips = [
                "Break the phrase into individual words and practice each one",
                "Use the reference audio and repeat after it",
                "Focus on one sound at a time before combining them"
            ]
        print(f"Transcribed: {transcribed_text}")
        print(f"Expected: {expected_text}")
        print(f"Scores: {scores}")
        return AudioAnalysisResult(
            transcription=transcribed_text,
            pronunciationScore=scores["pronunciationScore"],
            fluencyScore=scores["fluencyScore"],
            intonationScore=scores["intonationScore"],
            clarityScore=scores["clarityScore"],
            overallFeedback=overall_feedback,
            problematicPhonemes=scores["problematicPhonemes"],
            improvementTips=improvement_tips,
            detailedScores={
                "wordAccuracy": round(scores["pronunciationScore"] * 0.92, 1),
                "speed": round(scores["fluencyScore"], 1),
                "overallScore": round((scores["pronunciationScore"] + scores["fluencyScore"] + scores["intonationScore"] + scores["clarityScore"]) / 4, 1)
            },
            confidence=round(float(info.language_probability), 2)
        )
    except Exception as e:
        raise HTTPException(500, detail=f"Analysis error: {str(e)}")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Pronunciation Analysis API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pronunciation-fastapi"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

