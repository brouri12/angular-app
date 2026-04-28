package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.clients.UserClient;
import com.gestions.ramzi.servicefeedback.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service pour récupérer les informations des utilisateurs depuis service-user
 * Utilise Feign Client pour la communication inter-services
 */
@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserClient userClient;

    public UserService(UserClient userClient) {
        this.userClient = userClient;
        logger.info("UserService initialisé avec UserClient");
    }

    /**
     * Récupérer les informations d'un utilisateur par son ID
     * @param userId ID de l'utilisateur
     * @return UserDTO contenant les informations de l'utilisateur
     */
    public UserDTO getUserById(Long userId) {
        try {
            logger.info("Récupération de l'utilisateur avec ID: {}", userId);
            UserDTO user = userClient.getUserById(userId);
            if (user != null) {
                logger.info("Utilisateur trouvé: {}", user.getUsername());
            }
            return user;
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération de l'utilisateur {}: {}", userId, e.getMessage());
            // Retourner un utilisateur par défaut en cas d'erreur
            return createDefaultUser(userId);
        }
    }

    /**
     * Récupérer tous les utilisateurs
     */
    public java.util.List<UserDTO> getAllUsers() {
        try {
            logger.info("Récupération de tous les utilisateurs");
            return userClient.getAllUsers();
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des utilisateurs: {}", e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    /**
     * Créer un utilisateur par défaut en cas d'erreur
     */
    private UserDTO createDefaultUser(Long userId) {
        UserDTO defaultUser = new UserDTO();
        defaultUser.setId(userId);
        defaultUser.setUsername("Utilisateur-" + userId);
        defaultUser.setEmail("user" + userId + "@example.com");
        defaultUser.setRole("INCONNU");
        return defaultUser;
    }
}

