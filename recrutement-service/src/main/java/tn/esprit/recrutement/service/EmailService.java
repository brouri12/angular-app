package tn.esprit.recrutement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import tn.esprit.recrutement.entity.CandidatureEnseignant;
import tn.esprit.recrutement.entity.OffreRecrutement;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${recrutement.mail.from:noreply@esprit.tn}")
    private String fromEmail;

    @Async
    public void envoyerEmailAcceptation(CandidatureEnseignant candidature, OffreRecrutement offre) {
        if (candidature.getEmail() == null || candidature.getEmail().isBlank()) {
            log.warn("Email candidat vide, notification ignorée");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(candidature.getEmail());
            helper.setSubject("Félicitations ! Votre candidature a été acceptée — " + offre.getTitre());
            helper.setText(buildAcceptationHtml(candidature, offre), true);

            mailSender.send(message);
            log.info("Email d'acceptation envoyé à {}", candidature.getEmail());
        } catch (MessagingException e) {
            log.error("Erreur envoi email à {}: {}", candidature.getEmail(), e.getMessage());
        }
    }

    private String buildAcceptationHtml(CandidatureEnseignant c, OffreRecrutement o) {
        String nom = (c.getPrenom_candidat() != null ? c.getPrenom_candidat() : "")
                + " " + (c.getNom_candidat() != null ? c.getNom_candidat() : "");
        String html = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;"
                + "border:1px solid #e0e0e0;border-radius:8px;overflow:hidden'>"
                + "<div style='background:linear-gradient(135deg,#00c897,#ff7f50);padding:24px;text-align:center'>"
                + "<h1 style='color:white;margin:0;font-size:22px'>ESPRIT School of Engineering</h1>"
                + "<p style='color:rgba(255,255,255,0.9);margin:8px 0 0'>Service Recrutement</p>"
                + "</div>"
                + "<div style='padding:32px'>"
                + "<div style='text-align:center;margin-bottom:24px'>"
                + "<h2 style='color:#00c897;margin:8px 0'>Félicitations !</h2>"
                + "</div>"
                + "<p style='color:#1f2937;font-size:16px'>Bonjour <strong>" + nom.trim() + "</strong>,</p>"
                + "<p style='color:#4b5563;line-height:1.6'>Nous avons le plaisir de vous informer que votre candidature pour le poste de "
                + "<strong>" + o.getTitre() + "</strong> a été <strong style='color:#00c897'>acceptée</strong> par notre équipe.</p>"
                + "<div style='background:#f0fdf4;border-left:4px solid #00c897;padding:16px;border-radius:4px;margin:24px 0'>"
                + "<p style='margin:0;color:#374151'><strong>Poste :</strong> " + o.getTitre() + "</p>"
                + "<p style='margin:8px 0 0;color:#374151'><strong>Spécialité :</strong> " + o.getSpecialite() + "</p>"
                + "<p style='margin:8px 0 0;color:#374151'><strong>Type de contrat :</strong> " + o.getType_contrat() + "</p>"
                + "<p style='margin:8px 0 0;color:#00c897'><strong>Statut :</strong> ACCEPTÉE</p>"
                + "</div>"
                + "<p style='color:#4b5563;line-height:1.6'>Notre équipe RH vous contactera très prochainement "
                + "pour les prochaines étapes du processus d'intégration.</p>"
                + "<p style='color:#6b7280;font-size:14px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px'>"
                + "Cet email est envoyé automatiquement, merci de ne pas y répondre.<br>"
                + "© ESPRIT School of Engineering — Recrutement</p>"
                + "</div></div>";
        return html;
    }
}
