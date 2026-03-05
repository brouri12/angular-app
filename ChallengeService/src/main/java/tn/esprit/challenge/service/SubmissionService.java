package tn.esprit.challenge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.challenge.dto.QuestionResultDTO;
import tn.esprit.challenge.dto.SubmissionRequest;
import tn.esprit.challenge.dto.SubmissionResponse;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Question;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.enums.SubmissionStatus;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.QuestionRepository;
import tn.esprit.challenge.repository.SubmissionRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {
    
    private final SubmissionRepository submissionRepository;
    private final ChallengeRepository challengeRepository;
    private final QuestionRepository questionRepository;
    private final ChallengeService challengeService;
    
    @Transactional
    public SubmissionResponse submitChallenge(SubmissionRequest request) {
        // Get challenge and questions
        Challenge challenge = challengeRepository.findById(request.getChallengeId())
            .orElseThrow(() -> new RuntimeException("Challenge not found"));
        
        List<Question> questions = questionRepository.findByChallengeIdOrderByOrderIndexAsc(request.getChallengeId());
        
        // Create submission
        Submission submission = new Submission();
        submission.setChallengeId(request.getChallengeId());
        submission.setUserId(request.getUserId());
        submission.setAnswers(request.getAnswers());
        submission.setCompletionTime(request.getCompletionTime());
        submission.setHintsUsed(request.getHintsUsed());
        submission.setWrittenResponse(request.getWrittenResponse());
        submission.setTotalQuestions(questions.size());
        
        // Auto-grade the submission
        Map<Long, QuestionResultDTO> results = new HashMap<>();
        int correctCount = 0;
        int totalScore = 0;
        
        for (Question question : questions) {
            String userAnswer = request.getAnswers().get(question.getId());
            QuestionResultDTO result = gradeQuestion(question, userAnswer);
            results.put(question.getId(), result);
            
            if (result.getIsCorrect()) {
                correctCount++;
                totalScore += result.getPointsEarned();
            }
        }
        
        // Deduct points for hints used
        if (request.getHintsUsed() != null && request.getHintsUsed() > 0) {
            totalScore = Math.max(0, totalScore - (request.getHintsUsed() * 5));
        }
        
        submission.setCorrectAnswers(correctCount);
        submission.setScore(totalScore);
        
        // Determine status
        double percentage = (correctCount * 100.0) / questions.size();
        if (percentage >= 70) {
            submission.setStatus(SubmissionStatus.PASSED);
            challengeService.incrementSuccessfulCompletions(challenge.getId());
        } else if (percentage >= 50) {
            submission.setStatus(SubmissionStatus.PARTIAL);
        } else {
            submission.setStatus(SubmissionStatus.FAILED);
        }
        
        // Generate feedback
        submission.setFeedback(generateFeedback(percentage, correctCount, questions.size()));
        
        // Save submission
        Submission saved = submissionRepository.save(submission);
        
        // Update challenge statistics
        challengeService.incrementAttempts(challenge.getId());
        
        log.info("Submission created for user {} on challenge {}: {}/{} correct",
            request.getUserId(), request.getChallengeId(), correctCount, questions.size());
        
        // Build response
        return buildSubmissionResponse(saved, results);
    }
    
    private QuestionResultDTO gradeQuestion(Question question, String userAnswer) {
        QuestionResultDTO result = new QuestionResultDTO();
        result.setQuestionId(question.getId());
        result.setUserAnswer(userAnswer);
        result.setCorrectAnswer(question.getCorrectAnswer());
        result.setExplanation(question.getExplanation());
        
        boolean isCorrect = false;
        
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            isCorrect = false;
        } else {
            // Check if answer matches correct answer
            String normalizedUserAnswer = userAnswer.trim().toLowerCase();
            String normalizedCorrectAnswer = question.getCorrectAnswer().trim().toLowerCase();
            
            if (normalizedUserAnswer.equals(normalizedCorrectAnswer)) {
                isCorrect = true;
            } else if (question.getAcceptableAnswers() != null) {
                // Check acceptable answers
                for (String acceptable : question.getAcceptableAnswers()) {
                    if (normalizedUserAnswer.equals(acceptable.trim().toLowerCase())) {
                        isCorrect = true;
                        break;
                    }
                }
            }
        }
        
        result.setIsCorrect(isCorrect);
        result.setPointsEarned(isCorrect ? question.getPoints() : 0);
        
        return result;
    }
    
    private String generateFeedback(double percentage, int correct, int total) {
        if (percentage >= 90) {
            return String.format("Excellent work! You got %d out of %d questions correct (%.1f%%). Keep up the great work!", 
                correct, total, percentage);
        } else if (percentage >= 70) {
            return String.format("Good job! You got %d out of %d questions correct (%.1f%%). You passed this challenge!", 
                correct, total, percentage);
        } else if (percentage >= 50) {
            return String.format("Not bad! You got %d out of %d questions correct (%.1f%%). Review the explanations and try again!", 
                correct, total, percentage);
        } else {
            return String.format("You got %d out of %d questions correct (%.1f%%). Don't give up! Review the material and try again.", 
                correct, total, percentage);
        }
    }
    
    private SubmissionResponse buildSubmissionResponse(Submission submission, Map<Long, QuestionResultDTO> results) {
        SubmissionResponse response = new SubmissionResponse();
        response.setId(submission.getId());
        response.setChallengeId(submission.getChallengeId());
        response.setUserId(submission.getUserId());
        response.setStatus(submission.getStatus());
        response.setScore(submission.getScore());
        response.setCorrectAnswers(submission.getCorrectAnswers());
        response.setTotalQuestions(submission.getTotalQuestions());
        response.setPercentage(submission.getPercentage());
        response.setSubmittedAt(submission.getSubmittedAt());
        response.setCompletionTime(submission.getCompletionTime());
        response.setFeedback(submission.getFeedback());
        response.setQuestionResults(results);
        response.setPassed(submission.getStatus() == SubmissionStatus.PASSED);
        return response;
    }
    
    // Get submission by ID
    public SubmissionResponse getSubmissionById(Long id) {
        Submission submission = submissionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        // Rebuild question results
        List<Question> questions = questionRepository.findByChallengeIdOrderByOrderIndexAsc(submission.getChallengeId());
        Map<Long, QuestionResultDTO> results = new HashMap<>();
        
        for (Question question : questions) {
            String userAnswer = submission.getAnswers().get(question.getId());
            results.put(question.getId(), gradeQuestion(question, userAnswer));
        }
        
        return buildSubmissionResponse(submission, results);
    }
    
    // Get user's submissions
    public List<Submission> getUserSubmissions(Long userId) {
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }
    
    // Get user's total score
    public Integer getUserTotalScore(Long userId) {
        return submissionRepository.getTotalScoreByUserId(userId);
    }
}
