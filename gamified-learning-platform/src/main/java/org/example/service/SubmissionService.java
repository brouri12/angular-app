package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.QuestionResultDTO;
import org.example.dto.SubmissionRequest;
import org.example.dto.SubmissionResponse;
import org.example.entity.Question;
import org.example.entity.Submission;
import org.example.repository.GameRepository;
import org.example.repository.QuestionRepository;
import org.example.repository.SubmissionRepository;
import org.example.service.PlayerSessionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;
    private final PlayerSessionService sessionService;

    @Transactional
    public SubmissionResponse submit(SubmissionRequest request) {
        // gameId=0 is reserved for Crossword (no DB game entry)
        boolean isCrossword = request.getGameId() != null && request.getGameId() == 0;

        if (!isCrossword) {
            // Validate game exists for regular games
            gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found: " + request.getGameId()));
        }

        List<Question> questions = isCrossword
            ? java.util.Collections.emptyList()
            : questionRepository.findByGameIdOrderByOrderIndexAsc(request.getGameId());

        Submission submission = new Submission();
        submission.setGameId(request.getGameId());
        submission.setUserId(request.getUserId() != null ? request.getUserId() : "default-user");
        submission.setAnswers(request.getAnswers() != null ? request.getAnswers() : new HashMap<>());
        submission.setCompletionTime(request.getCompletionTime());
        submission.setTotalQuestions(questions.size());

        // Grade each question
        Map<Long, QuestionResultDTO> results = new HashMap<>();
        int correctCount = 0;
        int totalScore = 0;

        if (isCrossword) {
            // Crossword: use override values from request
            correctCount = request.getCorrectOverride() != null ? request.getCorrectOverride() : 0;
            int total = request.getTotalOverride() != null ? request.getTotalOverride() : 1;
            totalScore = request.getScoreOverride() != null ? request.getScoreOverride() : correctCount * 10;
            submission.setTotalQuestions(total);
        } else {
            for (Question question : questions) {
                String userAnswer = request.getAnswers() != null
                    ? request.getAnswers().get(question.getId())
                    : null;
                QuestionResultDTO result = gradeQuestion(question, userAnswer);
                results.put(question.getId(), result);
                if (result.getIsCorrect()) {
                    correctCount++;
                    totalScore += result.getPointsEarned();
                }
            }
        }

        submission.setCorrectAnswers(correctCount);
        submission.setScore(totalScore);

        // Determine status
        double percentage = questions.isEmpty() ? 0 : (correctCount * 100.0) / questions.size();
        if (percentage >= 70) {
            submission.setStatus("PASSED");
        } else if (percentage >= 50) {
            submission.setStatus("PARTIAL");
        } else {
            submission.setStatus("FAILED");
        }

        submission.setFeedback(generateFeedback(percentage, correctCount, questions.size()));

        Submission saved = submissionRepository.save(submission);

        // Award XP to player session
        boolean passed = "PASSED".equals(submission.getStatus());
        sessionService.awardXP(submission.getUserId(), totalScore, passed);

        log.info("Submission saved: user={} game={} score={}/{} ({}%)",
            saved.getUserId(), saved.getGameId(), correctCount, questions.size(), String.format("%.1f", percentage));

        return buildResponse(saved, results);
    }

    public SubmissionResponse getById(Long id) {
        Submission s = submissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Submission not found: " + id));

        List<Question> questions = questionRepository.findByGameIdOrderByOrderIndexAsc(s.getGameId());
        Map<Long, QuestionResultDTO> results = new HashMap<>();
        for (Question q : questions) {
            String answer = s.getAnswers() != null ? s.getAnswers().get(q.getId()) : null;
            results.put(q.getId(), gradeQuestion(q, answer));
        }

        return buildResponse(s, results);
    }

    public List<Submission> getUserSubmissions(String userId) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private QuestionResultDTO gradeQuestion(Question question, String userAnswer) {
        QuestionResultDTO result = new QuestionResultDTO();
        result.setQuestionId(question.getId());
        result.setUserAnswer(userAnswer);
        result.setCorrectAnswer(question.getCorrectAnswer());
        result.setExplanation(question.getExplanation());

        boolean correct = false;
        if (userAnswer != null && !userAnswer.trim().isEmpty()
                && question.getCorrectAnswer() != null) {
            correct = userAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim());
        }

        result.setIsCorrect(correct);
        result.setPointsEarned(correct ? question.getPoints() : 0);
        return result;
    }

    private String generateFeedback(double pct, int correct, int total) {
        if (pct >= 90) return String.format("Excellent! %d/%d correct (%.1f%%). Keep it up!", correct, total, pct);
        if (pct >= 70) return String.format("Good job! %d/%d correct (%.1f%%). You passed!", correct, total, pct);
        if (pct >= 50) return String.format("Not bad! %d/%d correct (%.1f%%). Review and try again!", correct, total, pct);
        return String.format("You got %d/%d correct (%.1f%%). Don't give up!", correct, total, pct);
    }

    private SubmissionResponse buildResponse(Submission s, Map<Long, QuestionResultDTO> results) {
        SubmissionResponse r = new SubmissionResponse();
        r.setId(s.getId());
        r.setGameId(s.getGameId());
        // Resolve game title
        String title = gameRepository.findById(s.getGameId())
            .map(g -> g.getTitle())
            .orElse(s.getGameId() == 0 ? "Crossword" : "Game #" + s.getGameId());
        r.setGameTitle(title);
        r.setUserId(s.getUserId());
        r.setStatus(s.getStatus());
        r.setScore(s.getScore());
        r.setCorrectAnswers(s.getCorrectAnswers());
        r.setTotalQuestions(s.getTotalQuestions());
        r.setPercentage(s.getPercentage());
        r.setSubmittedAt(s.getSubmittedAt());
        r.setCompletionTime(s.getCompletionTime());
        r.setFeedback(s.getFeedback());
        r.setQuestionResults(results);
        r.setPassed("PASSED".equals(s.getStatus()));
        return r;
    }
}
