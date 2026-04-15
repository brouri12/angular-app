package com.gestions.ramzi.servicefeedback.dto;

import java.util.Map;

/**
 * DTO pour les statistiques de réclamation d'un étudiant
 */
public class StudentReclamationStatsDTO {
    
    private Long userId;
    private Long totalReclamations;
    private Long reclamationEnAttente;
    private Long reclamationResolue;
    private Map<String, Long> reclamationsParStatut;
    private Map<String, Long> reclamationsParPriorite;
    private Map<String, Long> reclamationsParCategorie;
    
    public StudentReclamationStatsDTO() {}
    
    public StudentReclamationStatsDTO(Long userId, Long totalReclamations, Long reclamationEnAttente,
                                    Long reclamationResolue, Map<String, Long> reclamationsParStatut,
                                    Map<String, Long> reclamationsParPriorite,
                                    Map<String, Long> reclamationsParCategorie) {
        this.userId = userId;
        this.totalReclamations = totalReclamations;
        this.reclamationEnAttente = reclamationEnAttente;
        this.reclamationResolue = reclamationResolue;
        this.reclamationsParStatut = reclamationsParStatut;
        this.reclamationsParPriorite = reclamationsParPriorite;
        this.reclamationsParCategorie = reclamationsParCategorie;
    }
    
    // Getters et Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getTotalReclamations() {
        return totalReclamations;
    }
    
    public void setTotalReclamations(Long totalReclamations) {
        this.totalReclamations = totalReclamations;
    }
    
    public Long getReclamationEnAttente() {
        return reclamationEnAttente;
    }
    
    public void setReclamationEnAttente(Long reclamationEnAttente) {
        this.reclamationEnAttente = reclamationEnAttente;
    }
    
    public Long getReclamationResolue() {
        return reclamationResolue;
    }
    
    public void setReclamationResolue(Long reclamationResolue) {
        this.reclamationResolue = reclamationResolue;
    }
    
    public Map<String, Long> getReclamationsParStatut() {
        return reclamationsParStatut;
    }
    
    public void setReclamationsParStatut(Map<String, Long> reclamationsParStatut) {
        this.reclamationsParStatut = reclamationsParStatut;
    }
    
    public Map<String, Long> getReclamationsParPriorite() {
        return reclamationsParPriorite;
    }
    
    public void setReclamationsParPriorite(Map<String, Long> reclamationsParPriorite) {
        this.reclamationsParPriorite = reclamationsParPriorite;
    }
    
    public Map<String, Long> getReclamationsParCategorie() {
        return reclamationsParCategorie;
    }
    
    public void setReclamationsParCategorie(Map<String, Long> reclamationsParCategorie) {
        this.reclamationsParCategorie = reclamationsParCategorie;
    }
}

