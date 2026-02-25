package tn.esprit.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.user.dto.RegisterRequest;
import tn.esprit.user.dto.UpdateUserRequest;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.entity.User.UserRole;
import tn.esprit.user.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    // Endpoint de test
    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Bienvenue dans le microservice de gestion des utilisateurs!");
    }
    
    // Créer un utilisateur
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody RegisterRequest request) {
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    // Récupérer tous les utilisateurs
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    // Récupérer un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    // Récupérer un utilisateur par username
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        UserDTO user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    // Récupérer un utilisateur par email
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    // Récupérer les utilisateurs par rôle
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable UserRole role) {
        List<UserDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    // Récupérer les utilisateurs actifs/inactifs
    @GetMapping("/enabled/{enabled}")
    public ResponseEntity<List<UserDTO>> getUsersByEnabled(@PathVariable Boolean enabled) {
        List<UserDTO> users = userService.getUsersByEnabled(enabled);
        return ResponseEntity.ok(users);
    }
    
    // Rechercher des utilisateurs
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String query) {
        List<UserDTO> users = userService.searchUsers(query);
        return ResponseEntity.ok(users);
    }
    
    // Récupérer les étudiants par statut
    @GetMapping("/students/statut/{statut}")
    public ResponseEntity<List<UserDTO>> getStudentsByStatut(@PathVariable String statut) {
        List<UserDTO> students = userService.getStudentsByStatut(statut);
        return ResponseEntity.ok(students);
    }
    
    // Récupérer les enseignants par spécialité
    @GetMapping("/teachers/specialite")
    public ResponseEntity<List<UserDTO>> getTeachersBySpecialite(@RequestParam String specialite) {
        List<UserDTO> teachers = userService.getTeachersBySpecialite(specialite);
        return ResponseEntity.ok(teachers);
    }
    
    // Mettre à jour un utilisateur
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserDTO user = userService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }
    
    // Activer/Désactiver un utilisateur
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable Long id) {
        UserDTO user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }
    
    // Supprimer un utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    // Statistiques
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userService.getAllUsers().size());
        stats.put("totalAdmins", userService.countUsersByRole(UserRole.ADMIN));
        stats.put("totalTeachers", userService.countUsersByRole(UserRole.TEACHER));
        stats.put("totalStudents", userService.countUsersByRole(UserRole.STUDENT));
        stats.put("activeUsers", userService.getUsersByEnabled(true).size());
        stats.put("inactiveUsers", userService.getUsersByEnabled(false).size());
        return ResponseEntity.ok(stats);
    }
}
