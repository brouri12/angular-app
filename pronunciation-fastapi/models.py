from pydantic import BaseModel
from typing import List, Dict

class AudioAnalysisResult(BaseModel):
    transcription: str
    pronunciationScore: float
    fluencyScore: float
    intonationScore: float
    clarityScore: float
    overallFeedback: str
    problematicPhonemes: List[str]
    improvementTips: List[str]
    detailedScores: Dict[str, float]
    confidence: float

