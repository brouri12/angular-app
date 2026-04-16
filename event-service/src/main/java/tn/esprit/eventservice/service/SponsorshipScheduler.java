package tn.esprit.eventservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tn.esprit.eventservice.entity.Event;
import tn.esprit.eventservice.repository.EventRepository;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class SponsorshipScheduler {

    private static final long EXPIRY_MS = 60_000L; // 60 secondes

    // ✅ Bon URL: membre-service port 8087, endpoint /membres/club/{clubId}
    private static final String MEMBERS_BY_CLUB_URL =
            "http://localhost:8087/membres/club/{clubId}";

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RestTemplate restTemplate;

    @Scheduled(fixedDelay = 15_000)
    @Transactional
    public void checkExpiredSponsorships() {
        Date expiry = new Date(System.currentTimeMillis() - EXPIRY_MS);
        List<Event> expired = eventRepository.findExpiredSponsorships(expiry);

        for (Event event : expired) {
            Long clubId = event.getSponsorClubId();
            String eventTitle = event.getTitle();

            try {
                String presidentEmail = findPresidentEmail(clubId);

                if (presidentEmail != null && !presidentEmail.isBlank()) {
                    String subject = "⚠️ Votre sponsoring de l'événement \"" + eventTitle + "\" a expiré";
                    String html = buildExpiredEmail(eventTitle, presidentEmail);
                    emailService.sendHtml(presidentEmail, subject, html);
                    System.out.println("✅ Mail expiration envoyé à : " + presidentEmail + " pour event: " + eventTitle);
                } else {
                    System.out.println("⚠️ Aucun email président trouvé pour club #" + clubId);
                }
            } catch (Exception e) {
                System.out.println("⚠️ Erreur envoi mail expiration: " + e.getMessage());
            }

            // ✅ Remettre à null => bouton redevient visible côté frontend
            event.setSponsorClubId(null);
            event.setSponsoredAt(null);
            eventRepository.save(event);
            System.out.println("✅ Sponsoring réinitialisé pour event: " + eventTitle);
        }
    }

    /**
     * Appelle /membres/club/{clubId}, cherche le membre avec role=PRESIDENT
     * et retourne son email directement depuis l'entité Member.
     */
    private String findPresidentEmail(Long clubId) {
        try {
            Object[] members = restTemplate.getForObject(MEMBERS_BY_CLUB_URL, Object[].class, clubId);
            if (members == null || members.length == 0) {
                System.out.println("⚠️ Aucun membre trouvé pour club #" + clubId);
                return null;
            }

            for (Object m : members) {
                if (!(m instanceof Map<?, ?> member)) continue;

                Object roleObj = member.get("role");
                if (roleObj == null) continue;

                if ("PRESIDENT".equalsIgnoreCase(roleObj.toString())) {
                    Object emailObj = member.get("email");
                    if (emailObj != null && !emailObj.toString().isBlank()) {
                        return emailObj.toString();
                    }
                }
            }
            System.out.println("⚠️ Aucun président trouvé pour club #" + clubId);
        } catch (Exception e) {
            System.out.println("⚠️ Erreur appel membre-service: " + e.getMessage());
        }
        return null;
    }

    private String buildExpiredEmail(String eventTitle, String presidentEmail) {
        return "<div style='background:#f4f6fb;padding:20px;font-family:Arial'>"
             + "<table width='100%' style='max-width:600px;margin:auto;background:white;"
             + "border-radius:10px;border:1px solid #e5e7eb'>"
             + "<tr><td style='background:#7c3aed;color:white;padding:20px;font-size:18px;font-weight:bold'>"
             + "⚠️ Sponsoring expiré"
             + "</td></tr>"
             + "<tr><td style='padding:24px'>"
             + "<p style='font-size:15px;color:#374151'>Bonjour,</p>"
             + "<p style='font-size:15px;color:#374151'>Le sponsoring de votre club pour l'événement "
             + "<strong>" + eventTitle + "</strong> est maintenant <strong>expiré</strong>.</p>"
             + "<div style='background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:14px;margin:16px 0'>"
             + "🏆 <b>Votre abonnement de sponsoring pour cet événement est épuisé.</b><br><br>"
             + "Vous pouvez re-sponsoriser cet événement depuis votre espace membre."
             + "</div>"
             + "<p style='font-size:13px;color:#6b7280'>Merci,<br><b>jungle in english Team</b></p>"
             + "</td></tr></table></div>";
    }
}
