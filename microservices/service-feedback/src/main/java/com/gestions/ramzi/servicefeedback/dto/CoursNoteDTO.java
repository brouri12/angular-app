package com.gestions.ramzi.servicefeedback.dto;

/**
 * DTO pour les notes par cours
 */
public class CoursNoteDTO {
    
    private Long moduleId;
    private String moduleNom;
    private Double noteMoyenne;
    private Integer nombreFeedbacks;
    private String dernierSentiment;
    
    public CoursNoteDTO() {}
    
    public CoursNoteDTO(Long moduleId, String moduleNom, Double noteMoyenne, 
                       Integer nombreFeedbacks, String dernierSentiment) {
        this.moduleId = moduleId;
        this.moduleNom = moduleNom;
        this.noteMoyenne = noteMoyenne;
        this.nombreFeedbacks = nombreFeedbacks;
        this.dernierSentiment = dernierSentiment;
    }
    
    // Getters et Setters
    public Long getModuleId() {
        return moduleId;
    }
    
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
    
    public String getModuleNom() {
        return moduleNom;
    }
    
    public void setModuleNom(String moduleNom) {
        this.moduleNom = moduleNom;
    }
    
    public Double getNoteMoyenne() {
        return noteMoyenne;
    }
    
    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }
    
    public Integer getNombreFeedbacks() {
        return nombreFeedbacks;
    }
    
    public void setNombreFeedbacks(Integer nombreFeedbacks) {
        this.nombreFeedbacks = nombreFeedbacks;
    }
    
    public String getDernierSentiment() {
        return dernierSentiment;
    }
    
    public void setDernierSentiment(String dernierSentiment) {
        this.dernierSentiment = dernierSentiment;
    }
}

