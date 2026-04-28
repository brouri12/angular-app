package tn.esprit.recrutement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.recrutement.entity.CandidatureEnseignant;
import tn.esprit.recrutement.entity.OffreRecrutement;
import tn.esprit.recrutement.repository.CandidatureRepository;
import tn.esprit.recrutement.repository.OffreRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour CandidatureService.
 * Utilise Mockito pour isoler les dépendances.
 */
@ExtendWith(MockitoExtension.class)
class CandidatureServiceTest {

    @Mock
    private CandidatureRepository candidatureRepository;

    @Mock
    private OffreRepository offreRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private CandidatureService candidatureService;

    private OffreRecrutement offre;
    private CandidatureEnseignant candidature;

    @BeforeEach
    void setUp() {
        offre = new OffreRecrutement();
        offre.setId(1L);
        offre.setTitre("Enseignant Java");
        offre.setSpecialite("Informatique");
        offre.setStatut("OUVERTE");
        offre.setExperience_min(2);
        offre.setDate_limite(LocalDate.now().plusMonths(1));

        candidature = new CandidatureEnseignant();
        candidature.setId(1L);
        candidature.setNom_candidat("Dupont");
        candidature.setPrenom_candidat("Jean");
        candidature.setEmail("jean.dupont@gmail.com");
        candidature.setLettre_motivation("Je suis très motivé pour ce poste.");
        candidature.setStatut("EN_ATTENTE");
        candidature.setDate_candidature(LocalDate.now());
        candidature.setOffre(offre);
    }

    // ─── Test 1 : Postuler avec succès ───────────────────────────────────────
    @Test
    void postuler_Success() {
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(candidatureRepository.existsByEmailAndOffreId("jean.dupont@gmail.com", 1L)).thenReturn(false);
        when(candidatureRepository.save(any())).thenReturn(candidature);

        Optional<CandidatureEnseignant> result = candidatureService.postuler(1L, candidature);

        assertTrue(result.isPresent());
        assertEquals("EN_ATTENTE", result.get().getStatut());
        verify(candidatureRepository, times(1)).save(any());
    }

    // ─── Test 2 : Postuler — offre inexistante ────────────────────────────────
    @Test
    void postuler_OffreNotFound_ReturnsEmpty() {
        when(offreRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<CandidatureEnseignant> result = candidatureService.postuler(99L, candidature);

        assertFalse(result.isPresent());
        verify(candidatureRepository, never()).save(any());
    }

    // ─── Test 3 : Postuler — doublon détecté ─────────────────────────────────
    @Test
    void postuler_DoublonDetecte_ThrowsException() {
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(candidatureRepository.existsByEmailAndOffreId("jean.dupont@gmail.com", 1L)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> candidatureService.postuler(1L, candidature));

        assertTrue(ex.getMessage().contains("déjà postulé"));
        verify(candidatureRepository, never()).save(any());
    }

    // ─── Test 4 : Changer statut → ACCEPTEE envoie email ─────────────────────
    @Test
    void changerStatut_Acceptee_SendsEmail() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any())).thenReturn(candidature);
        when(offreRepository.save(any())).thenReturn(offre);

        Optional<CandidatureEnseignant> result = candidatureService.changerStatut(1L, "ACCEPTEE");

        assertTrue(result.isPresent());
        assertEquals("ACCEPTEE", result.get().getStatut());
        verify(emailService, times(1)).envoyerEmailAcceptation(any(), any());
    }

    // ─── Test 5 : Changer statut → REFUSEE ne change pas l'offre ─────────────
    @Test
    void changerStatut_Refusee_OffreRestOuverte() {
        when(candidatureRepository.findById(1L)).thenReturn(Optional.of(candidature));
        when(candidatureRepository.save(any())).thenReturn(candidature);

        candidatureService.changerStatut(1L, "REFUSEE");

        assertEquals("OUVERTE", offre.getStatut()); // L'offre reste ouverte
        verify(offreRepository, never()).save(any()); // Pas de sauvegarde offre
    }

    // ─── Test 6 : Détection doublon — même spécialité dans 30 jours ──────────
    @Test
    void estCandidatDoublon_True() {
        when(candidatureRepository.existsDoublon(
                eq("jean.dupont@gmail.com"),
                eq("Informatique"),
                any(LocalDate.class)
        )).thenReturn(true);

        boolean result = candidatureService.estCandidatDoublon("jean.dupont@gmail.com", "Informatique");

        assertTrue(result);
    }

    // ─── Test 7 : Détection doublon — pas de doublon ─────────────────────────
    @Test
    void estCandidatDoublon_False() {
        when(candidatureRepository.existsDoublon(anyString(), anyString(), any())).thenReturn(false);

        boolean result = candidatureService.estCandidatDoublon("nouveau@gmail.com", "Mathématiques");

        assertFalse(result);
    }

    // ─── Test 8 : Récupérer candidatures par offre ───────────────────────────
    @Test
    void getCandidaturesByOffre_ReturnsList() {
        when(candidatureRepository.findByOffreId(1L)).thenReturn(List.of(candidature));

        List<CandidatureEnseignant> result = candidatureService.getCandidaturesByOffre(1L);

        assertEquals(1, result.size());
        assertEquals("jean.dupont@gmail.com", result.get(0).getEmail());
    }
}
