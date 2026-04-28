package tn.esprit.recrutement;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import tn.esprit.recrutement.entity.CandidatureEnseignant;
import tn.esprit.recrutement.entity.OffreRecrutement;
import tn.esprit.recrutement.repository.CandidatureRepository;
import tn.esprit.recrutement.repository.OffreRepository;

import java.time.LocalDate;

import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableAsync
@EnableScheduling
@EnableFeignClients
public class RecrutementApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecrutementApplication.class, args);
    }

    @Bean
    ApplicationRunner init(OffreRepository offreRepository, CandidatureRepository candidatureRepository) {
        return args -> {
            // Vérifier si les données existent déjà
            if (offreRepository.count() > 0) {
                System.out.println("ℹ️ Données déjà présentes dans la base de données. Initialisation ignorée.");
                return;
            }

            System.out.println("⚠️ Insertion des données de test désactivée temporairement pour éviter les erreurs de validation.");
            System.out.println("✅ Service démarré avec succès. Utilisez l'interface pour créer des données.");
            
            /* DONNÉES DE TEST COMMENTÉES - À RÉACTIVER APRÈS VÉRIFICATION
            
            // Création de 2 offres
            OffreRecrutement offre1 = new OffreRecrutement();
            offre1.setTitre("Enseignant Java/Spring Boot");
            offre1.setDescription("Nous recherchons un enseignant expérimenté en développement Java et Spring Boot pour enseigner aux étudiants de niveau Licence et Master.");
            offre1.setSpecialite("Informatique");
            offre1.setType_contrat("CDI");
            offre1.setNombre_postes(2);
            offre1.setNiveau_requis("Master ou Doctorat");
            offre1.setExperience_min(3);
            offre1.setSalaire_min(2500.0);
            offre1.setSalaire_max(3500.0);
            offre1.setDate_publication(LocalDate.now());
            offre1.setDate_limite(LocalDate.now().plusMonths(2));
            offre1.setStatut("OUVERTE");
            offreRepository.save(offre1);

            OffreRecrutement offre2 = new OffreRecrutement();
            offre2.setTitre("Enseignant Intelligence Artificielle");
            offre2.setDescription("Poste d'enseignant en IA et Machine Learning pour former les étudiants aux dernières technologies d'apprentissage automatique.");
            offre2.setSpecialite("Intelligence Artificielle");
            offre2.setType_contrat("CDD");
            offre2.setNombre_postes(1);
            offre2.setNiveau_requis("Doctorat");
            offre2.setExperience_min(5);
            offre2.setSalaire_min(3000.0);
            offre2.setSalaire_max(4000.0);
            offre2.setDate_publication(LocalDate.now());
            offre2.setDate_limite(LocalDate.now().plusMonths(1));
            offre2.setStatut("OUVERTE");
            offreRepository.save(offre2);

            // Création de 2 candidatures avec données valides
            CandidatureEnseignant candidature1 = new CandidatureEnseignant();
            candidature1.setNom_candidat("Benahmed");
            candidature1.setPrenom_candidat("Mohamed");
            candidature1.setEmail("mohamed.benahmed@esprit.tn");
            candidature1.setCv_url("https://drive.google.com/file/d/1234567890/cv-mohamed-benahmed.pdf");
            candidature1.setLettre_motivation("Madame, Monsieur, je me permets de vous adresser ma candidature pour le poste d'enseignant en Java et Spring Boot. Fort de mes cinq années d'expérience dans l'enseignement supérieur et le développement d'applications web, je suis convaincu de pouvoir apporter une contribution significative à votre établissement. Ma passion pour la transmission des connaissances et mon expertise technique me permettent d'accompagner efficacement les étudiants dans leur apprentissage. Je reste à votre disposition pour un entretien. Cordialement.");
            candidature1.setDate_candidature(LocalDate.now());
            candidature1.setStatut("EN_ATTENTE");
            candidature1.setOffre(offre1);
            candidatureRepository.save(candidature1);

            CandidatureEnseignant candidature2 = new CandidatureEnseignant();
            candidature2.setNom_candidat("Trabelsi");
            candidature2.setPrenom_candidat("Fatma");
            candidature2.setEmail("fatma.trabelsi@esprit.tn");
            candidature2.setCv_url("https://www.dropbox.com/s/abc123/cv-fatma-trabelsi.pdf");
            candidature2.setLettre_motivation("Madame, Monsieur, titulaire d'un doctorat en Intelligence Artificielle et forte de six années d'expérience en recherche et enseignement, je souhaite rejoindre votre équipe pédagogique. Mon parcours académique et professionnel m'a permis de développer une expertise approfondie en Machine Learning et Deep Learning. Je suis particulièrement motivée par l'opportunité de former la nouvelle génération d'ingénieurs en IA. Mon approche pédagogique combine théorie et pratique pour garantir une formation de qualité. Je serais ravie de discuter de ma candidature lors d'un entretien. Respectueusement.");
            candidature2.setDate_candidature(LocalDate.now());
            candidature2.setStatut("EN_ATTENTE");
            candidature2.setOffre(offre2);
            candidatureRepository.save(candidature2);

            System.out.println("✅ Données initiales insérées : 2 offres et 2 candidatures");
            */
        };
    }
}
