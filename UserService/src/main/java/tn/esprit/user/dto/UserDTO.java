package tn.esprit.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.user.entity.User.UserRole;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id_user;
    private String username;
    private String email;
    private UserRole role;
    private Boolean enabled;
    private LocalDateTime date_creation;
    private LocalDateTime last_login;
    
    // Informations communes
    private String nom;
    private String prenom;
    private String telephone;
    
    // Champs TEACHER
    private String specialite;
    private Integer experience;
    private String disponibilite;
    
    // Champs STUDENT
    private LocalDate date_naissance;
    private String niveau_actuel;
    private String statut_etudiant;
    
    // Champs ADMIN
    private String poste;
}
