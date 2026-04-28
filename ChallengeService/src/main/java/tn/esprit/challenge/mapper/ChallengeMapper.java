package tn.esprit.challenge.mapper;

import tn.esprit.challenge.dto.ChallengeDTO;
import tn.esprit.challenge.dto.HintDTO;
import tn.esprit.challenge.dto.QuestionDTO;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Hint;
import tn.esprit.challenge.entity.Question;

import java.util.stream.Collectors;

public class ChallengeMapper {
    
    public static ChallengeDTO toDTO(Challenge challenge, boolean includeAnswers) {
        if (challenge == null) return null;
        
        ChallengeDTO dto = new ChallengeDTO();
        dto.setId(challenge.getId());
        dto.setTitle(challenge.getTitle());
        dto.setDescription(challenge.getDescription());
        dto.setType(challenge.getType());
        dto.setSkillFocus(challenge.getSkillFocus());
        dto.setLevel(challenge.getLevel());
        dto.setCategory(challenge.getCategory());
        dto.setPoints(challenge.getPoints());
        dto.setTimeLimit(challenge.getTimeLimit());
        dto.setContent(challenge.getContent());
        dto.setCreatedBy(challenge.getCreatedBy());
        dto.setCreatedAt(challenge.getCreatedAt());
        dto.setIsPublic(challenge.getIsPublic());
        dto.setTags(challenge.getTags());
        dto.setAverageRating(challenge.getAverageRating());
        dto.setTotalAttempts(challenge.getTotalAttempts());
        dto.setSuccessfulCompletions(challenge.getSuccessfulCompletions());
        dto.setSuccessRate(challenge.getSuccessRate());
        dto.setAudioUrl(challenge.getAudioUrl());
        dto.setImageUrl(challenge.getImageUrl());
        
        // Map questions
        if (challenge.getQuestions() != null) {
            dto.setQuestions(challenge.getQuestions().stream()
                .map(q -> QuestionMapper.toDTO(q, includeAnswers))
                .collect(Collectors.toList()));
        }
        
        // Map hints
        if (challenge.getHints() != null) {
            dto.setHints(challenge.getHints().stream()
                .map(ChallengeMapper::hintToDTO)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    public static Challenge toEntity(ChallengeDTO dto) {
        if (dto == null) return null;
        
        Challenge challenge = new Challenge();
        challenge.setId(dto.getId());
        challenge.setTitle(dto.getTitle());
        challenge.setDescription(dto.getDescription());
        challenge.setType(dto.getType());
        challenge.setSkillFocus(dto.getSkillFocus());
        challenge.setLevel(dto.getLevel());
        challenge.setCategory(dto.getCategory());
        challenge.setPoints(dto.getPoints());
        challenge.setTimeLimit(dto.getTimeLimit());
        challenge.setContent(dto.getContent());
        challenge.setCreatedBy(dto.getCreatedBy());
        challenge.setIsPublic(dto.getIsPublic());
        challenge.setTags(dto.getTags());
        challenge.setAudioUrl(dto.getAudioUrl());
        challenge.setImageUrl(dto.getImageUrl());
        
        return challenge;
    }
    
    private static HintDTO hintToDTO(Hint hint) {
        HintDTO dto = new HintDTO();
        dto.setId(hint.getId());
        dto.setLevel(hint.getLevel());
        dto.setContent(hint.getContent());
        dto.setPointsCost(hint.getPointsCost());
        return dto;
    }
}
