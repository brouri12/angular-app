package tn.esprit.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.user.dto.RegisterRequest;
import tn.esprit.user.dto.UpdateUserRequest;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.entity.User;
import tn.esprit.user.entity.User.UserRole;
import tn.esprit.user.exception.ResourceNotFoundException;
import tn.esprit.user.exception.UserAlreadyExistsException;
import tn.esprit.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final KeycloakService keycloakService;
    
    // Créer un utilisateur
    @Transactional
    public UserDTO createUser(RegisterRequest request) {
        // Vérifier si username existe
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        
        // Vérifier si email existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        
        // Créer l'utilisateur dans Keycloak
        String keycloakId = keycloakService.createKeycloakUser(request);
        
        User user = new User();
        user.setKeycloak_id(keycloakId);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(""); // Le mot de passe est géré par Keycloak
        user.setRole(request.getRole());
        user.setEnabled(true);
        
        // Informations communes
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        
        // Champs spécifiques selon le rôle
        if (request.getRole() == UserRole.TEACHER) {
            user.setSpecialite(request.getSpecialite());
            user.setExperience(request.getExperience());
            user.setDisponibilite(request.getDisponibilite());
        } else if (request.getRole() == UserRole.STUDENT) {
            user.setDate_naissance(request.getDate_naissance());
            user.setNiveau_actuel(request.getNiveau_actuel());
            user.setStatut_etudiant(request.getStatut_etudiant() != null ? request.getStatut_etudiant() : "Inscrit");
        } else if (request.getRole() == UserRole.ADMIN) {
            user.setPoste(request.getPoste());
        }
        
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }
    
    // Récupérer tous les utilisateurs
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer un utilisateur par ID
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }
    
    // Récupérer un utilisateur par username
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return convertToDTO(user);
    }
    
    // Récupérer un utilisateur par email
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return convertToDTO(user);
    }
    
    // Récupérer les utilisateurs par rôle
    public List<UserDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer les utilisateurs actifs/inactifs
    public List<UserDTO> getUsersByEnabled(Boolean enabled) {
        return userRepository.findByEnabled(enabled).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Rechercher par nom ou prénom
    public List<UserDTO> searchUsers(String search) {
        return userRepository.searchByNomOrPrenom(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer les étudiants par statut
    public List<UserDTO> getStudentsByStatut(String statut) {
        return userRepository.findStudentsByStatut(statut).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Récupérer les enseignants par spécialité
    public List<UserDTO> getTeachersBySpecialite(String specialite) {
        return userRepository.findTeachersBySpecialite(specialite).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Mettre à jour un utilisateur
    @Transactional
    public UserDTO updateUser(Long id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Vérifier si le nouveau username existe déjà (sauf pour l'utilisateur actuel)
        if (!user.getUsername().equals(request.getUsername()) && 
            userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        
        // Vérifier si le nouvel email existe déjà (sauf pour l'utilisateur actuel)
        if (!user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        
        // Mettre à jour dans Keycloak
        keycloakService.updateKeycloakUser(user.getKeycloak_id(), request);
        
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        
        // Informations communes
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        
        // Réinitialiser tous les champs spécifiques
        user.setSpecialite(null);
        user.setExperience(null);
        user.setDisponibilite(null);
        user.setDate_naissance(null);
        user.setNiveau_actuel(null);
        user.setStatut_etudiant(null);
        user.setPoste(null);
        
        // Champs spécifiques selon le rôle
        if (request.getRole() == UserRole.TEACHER) {
            user.setSpecialite(request.getSpecialite());
            user.setExperience(request.getExperience());
            user.setDisponibilite(request.getDisponibilite());
        } else if (request.getRole() == UserRole.STUDENT) {
            user.setDate_naissance(request.getDate_naissance());
            user.setNiveau_actuel(request.getNiveau_actuel());
            user.setStatut_etudiant(request.getStatut_etudiant());
        } else if (request.getRole() == UserRole.ADMIN) {
            user.setPoste(request.getPoste());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    // Mettre à jour un utilisateur (sans mot de passe)
    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Vérifier si le nouveau username existe déjà (sauf pour l'utilisateur actuel)
        if (!user.getUsername().equals(request.getUsername()) &&
            userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        // Vérifier si le nouvel email existe déjà (sauf pour l'utilisateur actuel)
        if (!user.getEmail().equals(request.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        // Mettre à jour dans Keycloak seulement si le mot de passe est fourni
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            // Convert UpdateUserRequest to RegisterRequest for Keycloak
            RegisterRequest keycloakRequest = new RegisterRequest();
            keycloakRequest.setUsername(request.getUsername());
            keycloakRequest.setEmail(request.getEmail());
            keycloakRequest.setPassword(request.getPassword());
            keycloakRequest.setRole(request.getRole());
            keycloakService.updateKeycloakUser(user.getKeycloak_id(), keycloakRequest);
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        // Informations communes
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());

        // Réinitialiser tous les champs spécifiques
        user.setSpecialite(null);
        user.setExperience(null);
        user.setDisponibilite(null);
        user.setDate_naissance(null);
        user.setNiveau_actuel(null);
        user.setStatut_etudiant(null);
        user.setPoste(null);

        // Champs spécifiques selon le rôle
        if (request.getRole() == UserRole.TEACHER) {
            user.setSpecialite(request.getSpecialite());
            user.setExperience(request.getExperience());
            user.setDisponibilite(request.getDisponibilite());
        } else if (request.getRole() == UserRole.STUDENT) {
            user.setDate_naissance(request.getDate_naissance());
            user.setNiveau_actuel(request.getNiveau_actuel());
            user.setStatut_etudiant(request.getStatut_etudiant());
        } else if (request.getRole() == UserRole.ADMIN) {
            user.setPoste(request.getPoste());
        }

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    
    // Activer/Désactiver un utilisateur
    @Transactional
    public UserDTO toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setEnabled(!user.getEnabled());
        
        // Mettre à jour dans Keycloak
        keycloakService.toggleKeycloakUserStatus(user.getKeycloak_id(), user.getEnabled());
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    // Mettre à jour la dernière connexion
    @Transactional
    public void updateLastLogin(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        user.setLast_login(LocalDateTime.now());
        userRepository.save(user);
    }
    
    // Supprimer un utilisateur
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Supprimer de Keycloak
        keycloakService.deleteKeycloakUser(user.getKeycloak_id());
        
        // Supprimer de la base de données
        userRepository.deleteById(id);
    }
    
    // Compter les utilisateurs par rôle
    public Long countUsersByRole(UserRole role) {
        return userRepository.countByRole(role);
    }
    
    // Convertir User en UserDTO
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId_user(user.getId_user());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setEnabled(user.getEnabled());
        dto.setDate_creation(user.getDate_creation());
        dto.setLast_login(user.getLast_login());
        
        // Informations communes
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setTelephone(user.getTelephone());
        
        // Champs spécifiques
        dto.setSpecialite(user.getSpecialite());
        dto.setExperience(user.getExperience());
        dto.setDisponibilite(user.getDisponibilite());
        dto.setDate_naissance(user.getDate_naissance());
        dto.setNiveau_actuel(user.getNiveau_actuel());
        dto.setStatut_etudiant(user.getStatut_etudiant());
        dto.setPoste(user.getPoste());
        
        return dto;
    }
}
