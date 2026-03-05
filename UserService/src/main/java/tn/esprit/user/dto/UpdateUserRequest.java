package tn.esprit.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.user.entity.User.UserRole;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    // Password is optional for updates
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotNull(message = "Role is required")
    private UserRole role;
    
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
