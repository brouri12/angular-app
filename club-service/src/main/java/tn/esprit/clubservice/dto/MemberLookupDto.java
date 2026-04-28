package tn.esprit.clubservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Sous-ensemble des champs renvoyés par /membres/by-user/{idUser} pour validation côté chat.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MemberLookupDto {

    private Long idUser;
    private Long idClub;
    private String status;
    private String nom;
    private String prenom;

    public Long getIdUser() { return idUser; }
    public void setIdUser(Long idUser) { this.idUser = idUser; }

    public Long getIdClub() { return idClub; }
    public void setIdClub(Long idClub) { this.idClub = idClub; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
}
