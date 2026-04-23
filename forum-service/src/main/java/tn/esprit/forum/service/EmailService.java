package tn.esprit.forum.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import tn.esprit.forum.entity.EmailLog;
import tn.esprit.forum.entity.EmailPreference;
import tn.esprit.forum.repository.EmailLogRepository;
import tn.esprit.forum.repository.EmailPreferenceRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private EmailPreferenceRepository emailPreferenceRepository;
    
    @Autowired
    private EmailLogRepository emailLogRepository;
    
    @Value("${forum.email.from-address:noreply@forum.tn}")
    private String fromAddress;
    
    @Value("${forum.email.from-name:Forum ESPRIT}")
    private String fromName;
    
    @Value("${forum.email.max-retry-attempts:3}")
    private int maxRetryAttempts;
    
    @Async
    public void sendWelcomeEmail(Long userId, String email, String username) {
        if (!shouldSendEmail(userId, "WELCOME")) {
            return;
        }
        
        String subject = "Bienvenue sur le Forum JUNGLE IN ENGLISH!";
        String htmlContent = String.format("""
            <html>
            <body>
                <h2>Bienvenue %s!</h2>
                <p>Nous sommes ravis de vous accueillir sur le Forum JUNGLE IN ENGLISH.</p>
                <p>Vous pouvez maintenant:</p>
                <ul>
                    <li>Participer aux discussions</li>
                    <li>Partager des fichiers multimédias</li>
                    <li>Utiliser notre chatbot d'assistance</li>
                </ul>
                <p><a href="http://localhost:65198">Accéder au forum</a></p>
                <p><a href="http://localhost:65198/preferences">Gérer vos préférences email</a></p>
            </body>
            </html>
            """, username);
        
        sendEmail(userId, email, subject, htmlContent, "WELCOME");
    }
    
    @Async
    public void sendReplyNotification(Long userId, String email, String replyAuthor, String replyPreview, String messageLink) {
        if (!shouldSendEmail(userId, "REPLY")) {
            return;
        }
        
        String subject = replyAuthor + " a répondu à votre message";
        String htmlContent = String.format("""
            <html>
            <body>
                <h2>Nouvelle réponse</h2>
                <p><strong>%s</strong> a répondu à votre message:</p>
                <blockquote>%s</blockquote>
                <p><a href="%s">Voir la discussion</a></p>
                <p><a href="http://localhost:65198/preferences">Gérer vos préférences</a></p>
            </body>
            </html>
            """, replyAuthor, replyPreview, messageLink);
        
        sendEmail(userId, email, subject, htmlContent, "REPLY");
    }
    
    @Async
    public void sendMentionAlert(Long userId, String email, String mentionAuthor, String messagePreview, String messageLink) {
        if (!shouldSendEmail(userId, "MENTION")) {
            return;
        }
        
        String subject = mentionAuthor + " vous a mentionné";
        String htmlContent = String.format("""
            <html>
            <body>
                <h2>Vous avez été mentionné</h2>
                <p><strong>%s</strong> vous a mentionné dans un message:</p>
                <blockquote>%s</blockquote>
                <p><a href="%s">Voir le message</a></p>
                <p><a href="http://localhost:65198/preferences">Gérer vos préférences</a></p>
            </body>
            </html>
            """, mentionAuthor, messagePreview, messageLink);
        
        sendEmail(userId, email, subject, htmlContent, "MENTION");
    }
    
    private void sendEmail(Long userId, String toEmail, String subject, String htmlContent, String emailType) {
        int retryCount = 0;
        boolean success = false;
        String errorMessage = null;
        
        while (retryCount < maxRetryAttempts && !success) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setFrom(fromAddress, fromName);
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                
                mailSender.send(message);
                success = true;
            } catch (Exception e) {
                errorMessage = e.getMessage();
                retryCount++;
                if (retryCount < maxRetryAttempts) {
                    try {
                        Thread.sleep(1000 * retryCount); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
        
        logEmailDelivery(userId, toEmail, emailType, subject, success, errorMessage, retryCount);
    }
    
    private boolean shouldSendEmail(Long userId, String emailType) {
        EmailPreference pref = emailPreferenceRepository.findByUserId(userId).orElse(null);
        
        if (pref == null) {
            // Create default preferences
            pref = new EmailPreference();
            pref.setUserId(userId);
            emailPreferenceRepository.save(pref);
            return true;
        }
        
        if (pref.getUnsubscribeAll()) {
            return false;
        }
        
        return switch (emailType) {
            case "WELCOME" -> pref.getWelcomeEmails();
            case "REPLY" -> pref.getReplyNotifications();
            case "MENTION" -> pref.getMentionAlerts();
            case "DIGEST" -> pref.getWeeklyDigests();
            case "SUMMARY" -> pref.getDailySummaries();
            case "REMINDER" -> pref.getUnreadReminders();
            default -> true;
        };
    }
    
    private void logEmailDelivery(Long userId, String email, String emailType, String subject, boolean success, String errorMessage, int retryCount) {
        EmailLog log = new EmailLog();
        log.setUserId(userId);
        log.setEmailAddress(email);
        log.setEmailType(emailType);
        log.setSubject(subject);
        log.setSuccess(success);
        log.setErrorMessage(errorMessage);
        log.setRetryCount(retryCount);
        emailLogRepository.save(log);
    }
}
