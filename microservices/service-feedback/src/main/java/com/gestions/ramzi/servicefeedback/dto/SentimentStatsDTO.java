package com.gestions.ramzi.servicefeedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SentimentStatsDTO {
    
    private long totalPositifs;
    private long totalNegatifs;
    private long totalNeutres;
    private long totalFeedbacks;
    
    private double pourcentagePositifs;
    private double pourcentageNegatifs;
    private double pourcentageNeutres;
    
    @Builder.Default
    private Map<String, Long> repartitionParSentiment = new HashMap<>();
    
    @Builder.Default
    private Map<String, Long> evolutionSentimentParMois = new HashMap<>();
    
    @Builder.Default
    private Map<String, Long> motsNegatifsFrequents = new HashMap<>();
}

