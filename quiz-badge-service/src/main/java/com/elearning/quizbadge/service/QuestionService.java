package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.QuestionDTO;
import com.elearning.quizbadge.entity.Question;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Question operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    
    @Transactional
    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        log.info("Creating new question for course: {}", questionDTO.getCourseId());
        
        Question question = questionDTO.toEntity();
        if (question.getIsActive() == null) {
            question.setIsActive(true);
        }
        
        Question saved = questionRepository.save(question);
        log.info("Question created with ID: {}", saved.getId());
        
        return QuestionDTO.fromEntity(saved);
    }
    
    @Transactional(readOnly = true)
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));
        return QuestionDTO.fromEntity(question);
    }
    
    @Transactional(readOnly = true)
    public Page<QuestionDTO> getAllQuestions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return questionRepository.findAll(pageable).map(QuestionDTO::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsByCourse(Long courseId) {
        return questionRepository.findByCourseId(courseId).stream()
                .map(QuestionDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public QuestionDTO updateQuestion(Long id, QuestionDTO questionDTO) {
        log.info("Updating question with ID: {}", id);
        
        Question existing = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with ID: " + id));
        
        existing.setQuestionText(questionDTO.getQuestionText());
        existing.setQuestionType(questionDTO.getQuestionType());
        existing.setPoints(questionDTO.getPoints());
        existing.setDifficultyLevel(questionDTO.getDifficultyLevel());
        existing.setCorrectAnswer(questionDTO.getCorrectAnswer());
        existing.setExplanation(questionDTO.getExplanation());
        existing.setOrderNumber(questionDTO.getOrderNumber());
        existing.setIsActive(questionDTO.getIsActive());
        
        Question updated = questionRepository.save(existing);
        log.info("Question updated: {}", updated.getId());
        
        return QuestionDTO.fromEntity(updated);
    }
    
    @Transactional
    public void deleteQuestion(Long id) {
        log.info("Deleting question with ID: {}", id);
        
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found with ID: " + id);
        }
        
        questionRepository.deleteById(id);
        log.info("Question deleted: {}", id);
    }
}
