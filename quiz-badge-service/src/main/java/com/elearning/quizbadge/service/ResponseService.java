package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.ResponseDTO;
import com.elearning.quizbadge.entity.Question;
import com.elearning.quizbadge.entity.Response;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.QuestionRepository;
import com.elearning.quizbadge.repository.ResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Response operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResponseService {
    
    private final ResponseRepository responseRepository;
    private final QuestionRepository questionRepository;
    
    @Transactional
    public ResponseDTO submitResponse(ResponseDTO responseDTO) {
        log.info("Submitting response for question: {} by student: {}", 
                responseDTO.getQuestionId(), responseDTO.getStudentId());
        
        // Get question to check answer
        Question question = questionRepository.findById(responseDTO.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        
        // Check if answer is correct
        boolean isCorrect = responseDTO.getAnswerText() != null && 
                responseDTO.getAnswerText().equalsIgnoreCase(question.getCorrectAnswer());
        
        // Calculate points earned
        int pointsEarned = isCorrect ? (question.getPoints() != null ? question.getPoints() : 0) : 0;
        
        // Count attempt number
        long existingAttempts = responseRepository.findByStudentIdAndQuestionId(
                responseDTO.getStudentId(), responseDTO.getQuestionId()).size();
        
        Response response = responseDTO.toEntity();
        response.setIsCorrect(isCorrect);
        response.setPointsEarned(pointsEarned);
        response.setAttemptNumber((int) existingAttempts + 1);
        
        Response saved = responseRepository.save(response);
        log.info("Response submitted - Correct: {}, Points: {}", isCorrect, pointsEarned);
        
        return ResponseDTO.fromEntity(saved);
    }
    
    @Transactional(readOnly = true)
    public List<ResponseDTO> getResponsesByStudent(Long studentId) {
        return responseRepository.findByStudentId(studentId).stream()
                .map(ResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ResponseDTO> getResponsesByQuestion(Long questionId) {
        return responseRepository.findByQuestionId(questionId).stream()
                .map(ResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ResponseDTO> getResponsesByEnrollment(Long enrollmentId) {
        return responseRepository.findByEnrollmentId(enrollmentId).stream()
                .map(ResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
