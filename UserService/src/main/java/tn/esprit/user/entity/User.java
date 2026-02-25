package tn.esprit.user.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_user;
    
    // ID Keycloak
    @Column(unique = true, length = 100)
    private String keycloak_id;
    
    // Informations de connexion
    @Column(nullable = false, unique = true, length = 50)
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @Column(length = 255)
    private String password; // Géré par Keycloak, stocké vide dans MySQL
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime date_creation;
    
    @Column
    private LocalDateTime last_login;
    
    // Informations communes (profil)
    @Column(length = 50)
    private String nom;
    
    @Column(length = 50)
    private String prenom;
    
    @Column(length = 20)
    private String telephone;
    
    // Champs spécifiques ENSEIGNANT (TEACHER)
    @Column(length = 100)
    private String specialite;
    
    @Column
    private Integer experience;
    
    @Column(length = 100)
    private String disponibilite;
    
    // Champs spécifiques ÉTUDIANT (STUDENT)
    @Column
    private LocalDate date_naissance;
    
    @Column(length = 50)
    private String niveau_actuel;
    
    @Column(length = 20)
    private String statut_etudiant; // Inscrit / Suspendu
    
    // Champs spécifiques ADMIN
    @Column(length = 50)
    private String poste; // Directeur / Responsable
    
    @PrePersist
    protected void onCreate() {
        this.date_creation = LocalDateTime.now();
        if (this.enabled == null) {
            this.enabled = true;
        }
    }
    
    // Enum pour les rôles
    public enum UserRole {
        ADMIN,
        TEACHER,
        STUDENT
    }
}
