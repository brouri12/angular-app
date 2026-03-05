package tn.esprit.user.service;

import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tn.esprit.user.dto.RegisterRequest;
import tn.esprit.user.entity.User.UserRole;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KeycloakService {
    
    private final Keycloak keycloak;
    
    @Value("${keycloak.realm}")
    private String realm;
    
    // Créer un utilisateur dans Keycloak
    public String createKeycloakUser(RegisterRequest request) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();
        
        // Vérifier si l'utilisateur existe déjà par username
        try {
            var existingUsers = usersResource.search(request.getUsername(), true);
            if (!existingUsers.isEmpty()) {
                throw new RuntimeException("User already exists in Keycloak with username: " + request.getUsername());
            }
        } catch (Exception e) {
            // Si la recherche échoue, on continue (l'utilisateur n'existe probablement pas)
            System.err.println("Warning: Could not search for existing user: " + e.getMessage());
        }
        
        // Créer la représentation de l'utilisateur (MINIMAL - seulement ce qui est nécessaire)
        UserRepresentation user = new UserRepresentation();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setEnabled(true);
        user.setEmailVerified(false);
        
        // Ajouter SEULEMENT le rôle comme attribut (les autres données sont dans MySQL)
        Map<String, java.util.List<String>> attributes = new HashMap<>();
        attributes.put("role", Collections.singletonList(request.getRole().name()));
        user.setAttributes(attributes);
        
        // Créer l'utilisateur
        Response response = usersResource.create(user);
        
        if (response.getStatus() != 201) {
            String errorMessage = "Failed to create user in Keycloak: " + response.getStatusInfo();
            if (response.getStatus() == 409) {
                errorMessage = "User already exists in Keycloak (username or email conflict)";
            }
            throw new RuntimeException(errorMessage);
        }
        
        // Récupérer l'ID de l'utilisateur créé
        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
        
        // Définir le mot de passe
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(request.getPassword());
        credential.setTemporary(false);
        
        UserResource userResource = usersResource.get(userId);
        userResource.resetPassword(credential);
        
        // Assigner le rôle
        assignRole(userId, request.getRole().name());
        
        return userId;
    }
    
    // Assigner un rôle à un utilisateur
    private void assignRole(String userId, String roleName) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();
        UserResource userResource = usersResource.get(userId);
        
        // Récupérer le rôle du realm
        var roleRepresentation = realmResource.roles().get(roleName).toRepresentation();
        
        // Assigner le rôle
        userResource.roles().realmLevel().add(Arrays.asList(roleRepresentation));
    }
    
    // Mettre à jour un utilisateur dans Keycloak
    public void updateKeycloakUser(String keycloakId, RegisterRequest request) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();
        UserResource userResource = usersResource.get(keycloakId);
        
        UserRepresentation user = userResource.toRepresentation();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        // Mettre à jour SEULEMENT le rôle (les autres données sont dans MySQL)
        Map<String, java.util.List<String>> attributes = new HashMap<>();
        attributes.put("role", Collections.singletonList(request.getRole().name()));
        user.setAttributes(attributes);
        
        userResource.update(user);
        
        // Mettre à jour le mot de passe si fourni
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(request.getPassword());
            credential.setTemporary(false);
            userResource.resetPassword(credential);
        }
    }
    
    // Supprimer un utilisateur de Keycloak
    public void deleteKeycloakUser(String keycloakId) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();
        usersResource.delete(keycloakId);
    }
    
    // Activer/Désactiver un utilisateur dans Keycloak
    public void toggleKeycloakUserStatus(String keycloakId, boolean enabled) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();
        UserResource userResource = usersResource.get(keycloakId);
        
        UserRepresentation user = userResource.toRepresentation();
        user.setEnabled(enabled);
        userResource.update(user);
    }
}
