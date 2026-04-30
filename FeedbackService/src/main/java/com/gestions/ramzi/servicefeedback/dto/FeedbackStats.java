package com.gestions.ramzi.servicefeedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackStats {
    private double moyenneNote;
    private long totalFeedbacks;
    private Map<Integer, Long> repartitionNotes;
    private Map<String, Long> feedbacksParMois;
    private long nouveauxAujourdhui;
    private Long moduleId;
}
