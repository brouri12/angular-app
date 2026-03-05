package tn.esprit.challenge.dto;

import lombok.Data;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.SkillFocus;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChallengeDTO {
    private Long id;
    private String title;
    private String description;
    private ChallengeType type;
    private SkillFocus skillFocus;
    private ProficiencyLevel level;
    private String category;
    private Integer points;
    private Integer timeLimit;
    private String content;
    private List<QuestionDTO> questions;
    private List<HintDTO> hints;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Boolean isPublic;
    private String tags;
    private Double averageRating;
    private Integer totalAttempts;
    private Integer successfulCompletions;
    private Double successRate;
    private String audioUrl;
    private String imageUrl;
}
