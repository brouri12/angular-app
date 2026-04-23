package tn.esprit.recrutement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.esprit.recrutement.entity.AdminNotification;
import tn.esprit.recrutement.entity.CandidatureEnseignant;
import tn.esprit.recrutement.entity.OffreRecrutement;
import tn.esprit.recrutement.repository.AdminNotificationRepository;
import tn.esprit.recrutement.repository.CandidatureRepository;
import tn.esprit.recrutement.repository.OffreRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CandidatureReminderScheduler {

    private final OffreRepository offreRepository;
    private final CandidatureRepository candidatureRepository;
    private final AdminNotificationRepository notificationRepository;

    // Every day at 13:30 (change to "0 0 9 * * *" for production)
    @Scheduled(cron = "0 20 09 * * *")
    public void verifierCandidaturesEnAttente() {
        log.info("⏰ Scheduler: vérification des candidatures EN_ATTENTE...");

        // Only active offers that haven't expired
        List<OffreRecrutement> offresActives = offreRepository.findByStatut("OUVERTE")
                .stream()
                .filter(o -> o.getDate_limite() != null && !o.getDate_limite().isBefore(LocalDate.now()))
                .toList();

        if (offresActives.isEmpty()) return;

        // Create one notification per offer that has EN_ATTENTE candidatures
        for (OffreRecrutement offre : offresActives) {
            List<CandidatureEnseignant> enAttente = candidatureRepository.findByOffreId(offre.getId())
                    .stream()
                    .filter(c -> "EN_ATTENTE".equals(c.getStatut()))
                    .toList();

            if (enAttente.isEmpty()) continue;

            String msg = enAttente.size() + " candidature(s) en attente pour l'offre \""
                    + offre.getTitre() + "\"";

            AdminNotification notif = new AdminNotification();
            notif.setMessage(msg);
            notif.setTotalEnAttente(enAttente.size());
            notif.setOffreId(offre.getId());
            notif.setOffreTitre(offre.getTitre());
            notif.setCreatedAt(LocalDateTime.now());
            notif.setLu(false);
            notificationRepository.save(notif);

            log.info("🔔 Notification créée : {}", msg);
        }
    }
}
