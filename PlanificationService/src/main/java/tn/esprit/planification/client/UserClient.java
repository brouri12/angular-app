package tn.esprit.planification.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
public class UserClient {
    
    private final RestTemplate restTemplate;
    private static final String USER_SERVICE_URL = "http://USER-SERVICE/api/users";
    
    public UserDTO getUserById(Long userId) {
        try {
            return restTemplate.getForObject(USER_SERVICE_URL + "/" + userId, UserDTO.class);
        } catch (RestClientException e) {
            System.err.println("Failed to fetch user " + userId + ": " + e.getMessage());
            return null;
        }
    }
    
    // Simple DTO to receive user data
    public static class UserDTO {
        private Long id_user;
        private String nom;
        private String prenom;
        private String email;
        
        public Long getId_user() { return id_user; }
        public void setId_user(Long id_user) { this.id_user = id_user; }
        
        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }
        
        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFullName() {
            return (prenom != null ? prenom : "") + " " + (nom != null ? nom : "");
        }
    }
}
