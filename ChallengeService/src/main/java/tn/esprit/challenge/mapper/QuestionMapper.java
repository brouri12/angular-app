package tn.esprit.challenge.mapper;

import tn.esprit.challenge.dto.QuestionDTO;
import tn.esprit.challenge.entity.Question;

public class QuestionMapper {
    
    public static QuestionDTO toDTO(Question question, boolean includeAnswers) {
        if (question == null) return null;
        
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setType(question.getType());
        dto.setQuestionText(question.getQuestionText());
        dto.setOptions(question.getOptions());
        dto.setPoints(question.getPoints());
        dto.setOrderIndex(question.getOrderIndex());
        dto.setImageUrl(question.getImageUrl());
        
        // Only include answers and explanations if requested (for teachers or after submission)
        if (includeAnswers) {
            dto.setCorrectAnswer(question.getCorrectAnswer());
            dto.setAcceptableAnswers(question.getAcceptableAnswers());
            dto.setExplanation(question.getExplanation());
        }
        
        return dto;
    }
    
    public static Question toEntity(QuestionDTO dto) {
        if (dto == null) return null;
        
        Question question = new Question();
        question.setId(dto.getId());
        question.setType(dto.getType());
        question.setQuestionText(dto.getQuestionText());
        question.setOptions(dto.getOptions());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        question.setAcceptableAnswers(dto.getAcceptableAnswers());
        question.setExplanation(dto.getExplanation());
        question.setPoints(dto.getPoints());
        question.setOrderIndex(dto.getOrderIndex());
        question.setImageUrl(dto.getImageUrl());
        
        return question;
    }
}
