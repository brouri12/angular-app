package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.entities.CategorieReclamation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service d'IA pour la classification automatique des réclamations
 * Utilise une approche basée sur les mots-clés
 */
@Service
public class ClassificationReclamationService {

    private static final Logger logger = LoggerFactory.getLogger(ClassificationReclamationService.class);

    // Mots-clés par catégorie (en minuscules)
    private static final Map<CategorieReclamation, List<String>> MOTS_CLES = Map.of(
        CategorieReclamation.TECHNIQUE, Arrays.asList(
            "bug", "erreur", "vidéo", "video", "charge", "lent", "bloqué", "bloque",
            "crash pas", "ne", "marche fonctionne", "ne marche", "connect", "connexion",
            "wifi", "internet", "écran", "ecran", "son", "audio", "image", "qualité vidéo",
            "téléchargement", "telechargement", "accès", "acces", "page", "site", "appli",
            "application", "mobile", "ordinateur", "pc", "ordi", "windows", "mac", "linux",
            "android", "ios", "iphone", "tablette", "problème technique", "dysfonctionnement"
        ),
        CategorieReclamation.FACTURATION, Arrays.asList(
            "paiement", "facture", "remboursement", "rembourser", "carte", "banque",
            "prix", "abonnement", "gratuit", "money", "cost", "devise", "dollar", "euro",
            "facturation", "facture", "recu", "reçu", "transaction", "erreur paiement",
            "payer", "souscription", "résilier", "resilier", "annuler", "annulation",
            "tarif", "reduction", "remise", "code promo", "coupon", "virement", "paypal",
            "stripe", "visa", "mastercard", "cb"
        ),
        CategorieReclamation.QUALITE, Arrays.asList(
            "mauvais", "mauvaise", "horrible", "déçu", "decu", "décevant", "decvant",
            "professeur", "instructeur", "formateur", "cours", "explication", "confus",
            "incompréhensible", "incomprehensible", "pas clair", "boring", "ennuyeux",
            "qualité", "qualite", "mauvaise qualité", "pauvre", "pire", "nul", "nulle",
            "déception", "deception", "pas utile", "inutile", "perte temps", "temps perdu",
            "Contenu", "contenu", "leçon", "lecon", "chapitre", "module", "formation"
        ),
        CategorieReclamation.ADMINISTRATIF, Arrays.asList(
            "certificat", "diplôme", "diplome", "attestation", "accès", "acces",
            "inscription", "inscrire", "compte", "mot de passe", "password", "mdp",
            "login", "email", "mail", "profil", "modifier", "supprimer", "données",
            "donnees", "privacy", "confidentialité", "confidentialite", "rgpd", "droit",
            "ké", "ker", "réinitialiser", "reinitialiser", "déverrouiller", "deverrouiller",
            "vérifier", "verifier", "validation", "approuver", "approuve"
        )
    );

    /**
     * Classifier automatiquement une réclamation basée sur son objet et description
     * @param objet Le titre/objet de la réclamation
     * @param description La description détaillée
     * @return La catégorie détectée
     */
    public CategorieReclamation classifier(String objet, String description) {
        String texte = "";
        
        if (objet != null && !objet.isBlank()) {
            texte += objet.toLowerCase() + " ";
        }
        if (description != null && !description.isBlank()) {
            texte += description.toLowerCase();
        }

        if (texte.isBlank()) {
            logger.debug("Aucun texte fourni pour classification, retour AUTRE");
            return CategorieReclamation.AUTRE;
        }

        logger.debug("Classification du texte: {}", texte.substring(0, Math.min(50, texte.length())));

        // Compter les matches par catégorie
        Map<CategorieReclamation, Integer> scores = new HashMap<>();
        
        for (CategorieReclamation categorie : CategorieReclamation.values()) {
            if (categorie == CategorieReclamation.AUTRE) continue; // Skip AUTRE in calculation
            
            int score = 0;
            List<String> motsCles = MOTS_CLES.get(categorie);
            
            if (motsCles != null) {
                for (String motCle : motsCles) {
                    if (texte.contains(motCle.toLowerCase())) {
                        score++;
                        // Bonus pour les mots trouvés dans l'objet (plus important)
                        if (objet != null && objet.toLowerCase().contains(motCle.toLowerCase())) {
                            score += 2;
                        }
                    }
                }
            }
            
            scores.put(categorie, score);
        }

        // Trouver la catégorie avec le meilleur score
        CategorieReclamation meilleureCategorie = CategorieReclamation.AUTRE;
        int meilleurScore = 0;

        for (Map.Entry<CategorieReclamation, Integer> entry : scores.entrySet()) {
            if (entry.getValue() > meilleurScore) {
                meilleurScore = entry.getValue();
                meilleureCategorie = entry.getKey();
            }
        }

        // Seuil minimum pour accepter la classification
        if (meilleurScore < 1) {
            logger.debug("Score trop faible ({}), classification AUTRE", meilleurScore);
            return CategorieReclamation.AUTRE;
        }

        logger.info("Réclamation分类: {} (score: {})", meilleureCategorie, meilleurScore);
        return meilleureCategorie;
    }

    /**
     * Version simplifiée avec juste un texte
     */
    public CategorieReclamation classifier(String texte) {
        return classifier(texte, null);
    }

    /**
     * Obtenir les mots-clés d'une catégorie (pour debug/affichage)
     */
    public List<String> getMotsCles(CategorieReclamation categorie) {
        return MOTS_CLES.getOrDefault(categorie, Collections.emptyList());
    }
}

