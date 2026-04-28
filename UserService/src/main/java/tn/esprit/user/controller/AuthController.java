package tn.esprit.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.user.dto.RegisterRequest;
import tn.esprit.user.dto.UserDTO;
import tn.esprit.user.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final Keycloak keycloak;
    
    // Inscription
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserDTO user = userService.createUser(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", user);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("details", e.getCause() != null ? e.getCause().getMessage() : "No details");
            error.put("type", e.getClass().getSimpleName());
            
            // Log l'erreur pour le débogage
            System.err.println("Registration error: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("Cause: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Récupérer l'utilisateur connecté
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Extract username from JWT token
        String username = null;
        if (authentication.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt) {
            org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) authentication.getPrincipal();
            username = jwt.getClaimAsString("preferred_username");
        }
        
        if (username == null) {
            username = authentication.getName(); // Fallback
        }
        
        UserDTO user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    // Endpoint d'information
    @GetMapping("/info")
    public ResponseEntity<String> info() {
        return ResponseEntity.ok("Pour vous connecter, utilisez Keycloak: http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token");
    }
    
    // Get user by email (for login with email)
    @GetMapping("/user-by-email")
    public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
        try {
            UserDTO user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found with email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    // Test de connexion Keycloak
    @GetMapping("/test-keycloak")
    public ResponseEntity<?> testKeycloak() {
        try {
            var realms = keycloak.realms().findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "Connected to Keycloak");
            response.put("realms_count", realms.size());
            response.put("realms", realms.stream().map(r -> r.getRealm()).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to connect to Keycloak");
            error.put("message", e.getMessage());
            error.put("details", e.getCause() != null ? e.getCause().getMessage() : "No details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
