package com.gestions.ramzi.serviceuser.controller;

import com.gestions.ramzi.serviceuser.entity.User;
import com.gestions.ramzi.serviceuser.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<User> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Endpoint pour récupérer l'utilisateur actuel basé sur le token JWT.
     * Utilisé par les autres services via Feign.
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Extraire l'ID utilisateur du token (claim "sub")
        String subject = jwt.getSubject();
        try {
            Long userId = Long.parseLong(subject);
            return service.getById(userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            // Si le subject n'est pas un ID numérique, chercher par username
            return service.getByUsername(subject)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return service.save(user);
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.save(user);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        return service.update(id, user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
