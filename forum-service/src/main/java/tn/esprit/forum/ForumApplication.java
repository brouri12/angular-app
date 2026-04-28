package tn.esprit.forum;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import tn.esprit.forum.entity.Forum;
import tn.esprit.forum.entity.MessageForum;
import tn.esprit.forum.repository.ForumRepository;
import tn.esprit.forum.repository.MessageForumRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

@SpringBootApplication
@EnableDiscoveryClient
public class ForumApplication {

    public static void main(String[] args) {
        SpringApplication.run(ForumApplication.class, args);
    }

    @Bean
    ApplicationRunner init(ForumRepository forumRepository, MessageForumRepository messageRepository) {
        return args -> {
            // Vérifier si les données existent déjà
            if (forumRepository.count() > 0) {
                System.out.println("ℹ️ Données déjà présentes dans la base de données. Initialisation ignorée.");
                return;
            }

            System.out.println("⚠️ Insertion des données de test désactivée temporairement pour éviter les erreurs de validation.");
            System.out.println("✅ Service démarré avec succès. Utilisez l'interface pour créer des données.");
            
            /* DONNÉES DE TEST COMMENTÉES - À RÉACTIVER APRÈS VÉRIFICATION
            
            // Création de 2 forums
            Forum forum1 = new Forum();
            forum1.setTitre("Discussion Java Spring Boot");
            forum1.setDescription("Forum dédié aux questions sur Spring Boot et Java");
            forum1.setDate_creation(LocalDate.now());
            forum1.setCree_par(1L);
            forum1.setNiveau("L3");
            forum1.setGroupe("INFO-A");
            forum1.setCours("Développement Web");
            forum1.setStatut("OUVERT");
            forumRepository.save(forum1);

            Forum forum2 = new Forum();
            forum2.setTitre("Projet Angular - Questions");
            forum2.setDescription("Espace d'entraide pour le projet Angular");
            forum2.setDate_creation(LocalDate.now());
            forum2.setCree_par(2L);
            forum2.setNiveau("M1");
            forum2.setGroupe("INFO-B");
            forum2.setCours("Framework Frontend");
            forum2.setStatut("OUVERT");
            forumRepository.save(forum2);

            // Création de 5 messages
            MessageForum msg1 = new MessageForum();
            msg1.setContenu("Bonjour, comment configurer Spring Security ?");
            msg1.setDate_message(LocalDateTime.now());
            msg1.setAuteurId(101L);
            msg1.setType_auteur("ETUDIANT");
            msg1.setStatut("ACTIF");
            msg1.setForum(forum1);
            messageRepository.save(msg1);

            MessageForum msg2 = new MessageForum();
            msg2.setContenu("Voici un tutoriel complet sur Spring Security...");
            msg2.setDate_message(LocalDateTime.now().plusMinutes(10));
            msg2.setAuteurId(201L);
            msg2.setType_auteur("ENSEIGNANT");
            msg2.setStatut("ACTIF");
            msg2.setForum(forum1);
            messageRepository.save(msg2);

            MessageForum msg3 = new MessageForum();
            msg3.setContenu("Merci beaucoup pour l'aide !");
            msg3.setDate_message(LocalDateTime.now().plusMinutes(20));
            msg3.setAuteurId(101L);
            msg3.setType_auteur("ETUDIANT");
            msg3.setStatut("ACTIF");
            msg3.setForum(forum1);
            messageRepository.save(msg3);

            MessageForum msg4 = new MessageForum();
            msg4.setContenu("Comment utiliser les services dans Angular ?");
            msg4.setDate_message(LocalDateTime.now());
            msg4.setAuteurId(102L);
            msg4.setType_auteur("ETUDIANT");
            msg4.setStatut("ACTIF");
            msg4.setForum(forum2);
            messageRepository.save(msg4);

            MessageForum msg5 = new MessageForum();
            msg5.setContenu("Les services Angular permettent de partager des données...");
            msg5.setDate_message(LocalDateTime.now().plusMinutes(5));
            msg5.setAuteurId(202L);
            msg5.setType_auteur("ENSEIGNANT");
            msg5.setStatut("ACTIF");
            msg5.setForum(forum2);
            messageRepository.save(msg5);

            System.out.println("✅ Données initiales insérées : 2 forums et 5 messages");
            */
        };
    }
}
