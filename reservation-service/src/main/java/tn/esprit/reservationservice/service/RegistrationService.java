package tn.esprit.reservationservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tn.esprit.reservationservice.entity.Registration;
import tn.esprit.reservationservice.repository.RegistrationRepository;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String EVENT_SERVICE_URL = "http://localhost:8082/events/{id}";
    private static final String EVENT_DECREMENT_URL = "http://localhost:8082/events/{id}/capacity/decrement";
    private static final String EVENT_INCREMENT_URL = "http://localhost:8082/events/{id}/capacity/increment";
    private static final String USER_SERVICE_URL = "http://localhost:8888/user-service/api/users/{id}/public-name";

    // ===============================
    // GET ALL
    // ===============================
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public List<Registration> getRegistrationsByEventId(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public Optional<Registration> getRegistrationById(Long id) {
        return registrationRepository.findById(id);
    }

    public List<Registration> getRegistrationsByUserId(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public int deleteByEventId(Long eventId) {
        return registrationRepository.deleteAllByEventId(eventId);
    }

    public Registration updateRegistration(Long id, Registration registrationDetails) {

        Registration existing = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration introuvable"));

        // ✅ Ne modifier que le status — tout le reste reste intact
        if (registrationDetails.getStatus() != null) {
            existing.setStatus(registrationDetails.getStatus());
        }

        return registrationRepository.save(existing);
    }

    // ===============================
    // DELETE
    // ===============================
    @Transactional
    public void deleteRegistration(Long id) {

        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration introuvable"));

        try {
            restTemplate.put(EVENT_INCREMENT_URL, null, reg.getEventId());
        } catch (Exception ignored) {}

        registrationRepository.deleteById(id);
    }

    // ===============================
    // CREATE REGISTRATION
    // ===============================
    @Transactional
    public Registration createRegistration(Registration registration, String authHeader) {

        Long eventId = registration.getEventId();
        Long userId = registration.getUserId();

        if (eventId == null) throw new RuntimeException("eventId obligatoire");
        if (userId == null) throw new RuntimeException("userId obligatoire");

        Object eventObj = restTemplate.getForObject(EVENT_SERVICE_URL, Object.class, eventId);

        if (eventObj == null)
            throw new RuntimeException("Event introuvable");

        if (registrationRepository.existsByUserIdAndEventId(userId, eventId))
            throw new RuntimeException("Utilisateur déjà inscrit");

        restTemplate.put(EVENT_DECREMENT_URL, null, eventId);

        if (registration.getRegistrationDate() == null)
            registration.setRegistrationDate(new Date());

        // ✅ Récupérer nom/prenom depuis UserService
        try {
            @SuppressWarnings("unchecked")
            java.util.Map<String, String> userInfo = restTemplate.getForObject(
                USER_SERVICE_URL, java.util.Map.class, userId
            );
            if (userInfo != null) {
                String displayName = userInfo.get("displayName");
                if (displayName != null && !displayName.isBlank()) {
                    String[] parts = displayName.trim().split("\\s+", 2);
                    registration.setPrenom(parts[0]);
                    registration.setNom(parts.length > 1 ? parts[1] : "");
                }
            }
        } catch (Exception ignored) {}

        Registration saved = registrationRepository.save(registration);

        try {

            String toEmail = extractEmailFromJwt(authHeader);

            if (toEmail == null || toEmail.isBlank()) {
                System.out.println("Email introuvable dans le token");
                return saved;
            }

            Map<?, ?> ev = (eventObj instanceof Map<?, ?> m) ? m : null;

            String title = getSafe(ev, "title");
            String description = getSafe(ev, "description");
            String type = getSafe(ev, "type");
            String location = getSafe(ev, "location");
            String startTime = getSafe(ev, "startTime");
            String endTime = getSafe(ev, "endTime");
            String eventDate = getSafe(ev, "eventDate");

            // fallback si eventDate null
            if (eventDate.equals("Non spécifié")) {
                eventDate = startTime;
            }

            String subject = "Confirmation d'inscription";

            String content = buildPrettyHtmlEmail(
                    title,
                    description,
                    type,
                    location,
                    startTime,
                    endTime,
                    eventDate
            );

            emailService.sendEventEmailHtml(toEmail, subject, content);

            System.out.println("EMAIL envoyé à : " + toEmail);

        } catch (Exception e) {

            System.out.println("Erreur envoi email: " + e.getMessage());
        }

        return saved;
    }

    // ===============================
    // EMAIL HTML TEMPLATE
    // ===============================
    private String buildPrettyHtmlEmail(
            String title,
            String description,
            String type,
            String location,
            String startTime,
            String endTime,
            String eventDate
    ) {
        return
            "<div style='margin:0;padding:0;background:#f0f4f8;font-family:Inter,Segoe UI,Arial,sans-serif'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='max-width:620px;margin:0 auto;padding:32px 16px'>" +
            "<tr><td>" +

            // Header
            "<div style='background:linear-gradient(135deg,#00c897,#6366f1);border-radius:20px 20px 0 0;padding:36px 32px 28px;text-align:center'>" +
            "<div style='font-size:40px;margin-bottom:10px'>🎉</div>" +
            "<h1 style='margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em'>Inscription confirmée !</h1>" +
            "<p style='margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px'>Vous êtes inscrit à l'événement suivant</p>" +
            "</div>" +

            // Event title banner
            "<div style='background:#fff;border-left:4px solid #00c897;padding:18px 24px;margin:0'>" +
            "<p style='margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b'>Événement</p>" +
            "<h2 style='margin:6px 0 0;font-size:20px;font-weight:900;color:#0f172a;letter-spacing:-0.01em'>" + escape(title) + "</h2>" +
            "</div>" +

            // Details grid
            "<div style='background:#fff;padding:24px 24px 8px;border-top:1px solid #f1f5f9'>" +

            detailRow("📅", "Date", eventDate) +
            detailRow("🕐", "Début", startTime) +
            detailRow("🕔", "Fin", endTime) +
            detailRow("🏷️", "Type", type) +
            detailRow("📍", "Lieu", location) +

            "</div>" +

            // Description
            "<div style='background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 24px'>" +
            "<p style='margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#64748b'>Description</p>" +
            "<p style='margin:0;font-size:14px;color:#475569;line-height:1.7'>" + escape(description) + "</p>" +
            "</div>" +

            // Footer
            "<div style='background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:0 0 20px 20px;padding:24px 32px;text-align:center'>" +
            "<p style='margin:0 0 4px;color:rgba(255,255,255,0.9);font-size:14px;font-weight:700'>jungle in english</p>" +
            "<p style='margin:0;color:rgba(255,255,255,0.5);font-size:12px'>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>" +
            "</div>" +

            "</td></tr></table></div>";
    }

    private String detailRow(String icon, String label, String value) {
        return
            "<div style='display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9'>" +
            "<span style='font-size:18px;line-height:1.4;flex-shrink:0'>" + icon + "</span>" +
            "<div style='flex:1'>" +
            "<p style='margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8'>" + escape(label) + "</p>" +
            "<p style='margin:3px 0 0;font-size:14px;font-weight:700;color:#0f172a'>" + escape(value) + "</p>" +
            "</div></div>";
    }

    // ===============================
    // SAFE VALUE
    // ===============================
    private String getSafe(Map<?, ?> ev, String key) {

        if (ev == null) return "Non spécifié";

        Object v = ev.get(key);

        if (v == null) return "Non spécifié";

        String s = String.valueOf(v);

        return s.isBlank() ? "Non spécifié" : s;
    }

    // ===============================
    // JWT EMAIL
    // ===============================
    private String extractEmailFromJwt(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;

        try {

            String token = authHeader.substring(7);

            String[] parts = token.split("\\.");

            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);

            JsonNode json = new ObjectMapper().readTree(payloadJson);

            if (json.has("email"))
                return json.get("email").asText();

            if (json.has("preferred_username"))
                return json.get("preferred_username").asText();

        } catch (Exception ignored) {}

        return null;
    }

    private String escape(String s) {

        if (s == null) return "";

        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}