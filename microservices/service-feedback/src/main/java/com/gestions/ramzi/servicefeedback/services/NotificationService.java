package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.entities.Feedback;
import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender mailSender;

    // Configuration - À modifier selon vos besoins
    private static final String ADMIN_EMAIL = "jasserelghoul11@gmail.com";

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        logger.info("NotificationService initialized");
    }

    /**
     * Envoyer une notification lors d'un nouveau feedback
     */
    public void notifierNouvelFeedback(Feedback feedback) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(ADMIN_EMAIL);
            message.setSubject("Nouveau feedback reçu - Note: " + feedback.getNote());
            message.setText("Un nouveau feedback a été soumis:\n\n"
                    + "ID: " + feedback.getId() + "\n"
                    + "Note: " + feedback.getNote() + "/5\n"
                    + "User ID: " + feedback.getUserId() + "\n"
                    + "Module ID: " + feedback.getModuleId() + "\n"
                    + "Commentaire: " + (feedback.getCommentaire() != null ? feedback.getCommentaire() : "Aucun"));
            
            mailSender.send(message);
            logger.info("Email de notification nouveau feedback envoyé - ID: {}", feedback.getId());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de feedback: {}", e.getMessage());
        }
    }

    /**
     * Envoyer une alerte lors d'un feedback négatif (note ≤ 2)
     */
    public void notifierFeedbackNegatif(Feedback feedback) {
        if (feedback.getNote() != null && feedback.getNote() <= 2) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(ADMIN_EMAIL);
                message.setSubject("⚠️ ALERTE: Feedback négatif détecté!");
                message.setText("Un feedback négatif a été soumis:\n\n"
                        + "ID: " + feedback.getId() + "\n"
                        + "Note: " + feedback.getNote() + "/5\n"
                        + "User ID: " + feedback.getUserId() + "\n"
                        + "Module ID: " + feedback.getModuleId() + "\n"
                        + "Commentaire: " + (feedback.getCommentaire() != null ? feedback.getCommentaire() : "Aucun"));
                
                mailSender.send(message);
                logger.warn("Alerte feedback négatif envoyée - ID: {}, Note: {}", feedback.getId(), feedback.getNote());
            } catch (Exception e) {
                logger.error("Erreur lors de l'envoi de l'alerte feedback négatif: {}", e.getMessage());
            }
        }
    }

    /**
     * Envoyer une notification lors d'une nouvelle réclamation
     */
    public void notifierNouvelleReclamation(Reclamation reclamation) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(ADMIN_EMAIL);
            message.setSubject("Nouvelle réclamation - " + reclamation.getObjet());
            message.setText("Une nouvelle réclamation a été soumise:\n\n"
                    + "ID: " + reclamation.getId() + "\n"
                    + "User ID: " + reclamation.getUserId() + "\n"
                    + "Objet: " + reclamation.getObjet() + "\n"
                    + "Description: " + (reclamation.getDescription() != null ? reclamation.getDescription() : "Aucun")
                    + "\n\nMerci de traiter cette réclamation rapidement.");
            
            mailSender.send(message);
            logger.info("Email de notification nouvelle réclamation envoyé - ID: {}", reclamation.getId());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email de réclamation: {}", e.getMessage());
        }
    }

    /**
     * Envoyer une notification lors de la résolution d'une réclamation
     */
    public void notifierReclamationResolue(Reclamation reclamation) {
        if (reclamation.getUserId() != null) {
            try {
                // Note: Pour envoyer à l'utilisateur, vous auriez besoin de son email
                // Ici on envoie juste à l'admin pour informa
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(ADMIN_EMAIL);
                message.setSubject("Réclamation résolue - ID: " + reclamation.getId());
                message.setText("Une réclamation a été résolue:\n\n"
                        + "ID: " + reclamation.getId() + "\n"
                        + "Objet: " + reclamation.getObjet() + "\n"
                        + "Status: " + reclamation.getStatus());
                
                mailSender.send(message);
                logger.info("Email de notification réclamation résolue envoyé - ID: {}", reclamation.getId());
            } catch (Exception e) {
                logger.error("Erreur lors de l'envoi de l'email de résolution: {}", e.getMessage());
            }
        }
    }

    /**
     * Envoyer un email générique
     */
    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            logger.info("Email envoyé à: {}", to);
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de l'email: {}", e.getMessage());
        }
    }

    /**
     * Envoyer une notification urgente pour les réclamations CRITIQUE ou HAUTE
     */
    public void notifierReclamationUrgente(Reclamation reclamation) {
        if (reclamation.getPriorite() == null) {
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(ADMIN_EMAIL);
            
            String prioriteEmoji = reclamation.getPriorite().getEmoji();
            String prioriteLibelle = reclamation.getPriorite().getLibelle();
            
            message.setSubject(prioriteEmoji + " URGENT: Réclamation " + prioriteLibelle + " - ID: " + reclamation.getId());
            message.setText("🔴 RÉCLAMATION URGENTE 🔴\n\n"
                    + "Priorité: " + prioriteEmoji + " " + prioriteLibelle + "\n"
                    + "ID: " + reclamation.getId() + "\n"
                    + "User ID: " + reclamation.getUserId() + "\n"
                    + "Objet: " + reclamation.getObjet() + "\n"
                    + "Description: " + (reclamation.getDescription() != null ? reclamation.getDescription() : "Aucun") + "\n"
                    + "Status: " + reclamation.getStatus() + "\n"
                    + "Date: " + reclamation.getDate() + "\n\n"
                    + "⚠️ Cette réclamation nécessite une attention immédiate!");
            
            mailSender.send(message);
            logger.warn("Notification urgente envoyée pour réclamation ID: {}, Priorité: {}", 
                reclamation.getId(), reclamation.getPriorite());
        } catch (Exception e) {
            logger.error("Erreur lors de l'envoi de la notification urgente: {}", e.getMessage());
        }
    }
}
