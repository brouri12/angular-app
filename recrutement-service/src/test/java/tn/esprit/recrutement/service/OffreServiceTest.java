package tn.esprit.recrutement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.recrutement.entity.OffreRecrutement;
import tn.esprit.recrutement.repository.OffreRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour OffreService.
 */
@ExtendWith(MockitoExtension.class)
class OffreServiceTest {

    @Mock
    private OffreRepository offreRepository;

    @InjectMocks
    private OffreService offreService;

    private OffreRecrutement offre;

    @BeforeEach
    void setUp() {
        offre = new OffreRecrutement();
        offre.setId(1L);
        offre.setTitre("Enseignant Mathématiques");
        offre.setSpecialite("Mathématiques");
        offre.setType_contrat("CDI");
        offre.setNombre_postes(2);
        offre.setNiveau_requis("Master");
        offre.setExperience_min(3);
        offre.setDate_publication(LocalDate.now());
        offre.setDate_limite(LocalDate.now().plusMonths(2));
        offre.setStatut("OUVERTE");
    }

    // ─── Test 1 : Créer une offre ─────────────────────────────────────────────
    @Test
    void addOffre_SetsDatePublicationAndStatut() {
        when(offreRepository.save(any())).thenReturn(offre);

        OffreRecrutement result = offreService.addOffre(offre);

        assertNotNull(result);
        assertEquals("OUVERTE", result.getStatut());
        verify(offreRepository, times(1)).save(any());
    }

    // ─── Test 2 : Récupérer toutes les offres ────────────────────────────────
    @Test
    void getAllOffres_ReturnsList() {
        when(offreRepository.findAll()).thenReturn(List.of(offre));

        List<OffreRecrutement> result = offreService.getAllOffres();

        assertEquals(1, result.size());
        assertEquals("Enseignant Mathématiques", result.get(0).getTitre());
    }

    // ─── Test 3 : Récupérer offre par ID — trouvée ───────────────────────────
    @Test
    void getOffreById_Found() {
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));

        Optional<OffreRecrutement> result = offreService.getOffreById(1L);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
    }

    // ─── Test 4 : Récupérer offre par ID — non trouvée ───────────────────────
    @Test
    void getOffreById_NotFound() {
        when(offreRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<OffreRecrutement> result = offreService.getOffreById(99L);

        assertFalse(result.isPresent());
    }

    // ─── Test 5 : Fermer une offre ────────────────────────────────────────────
    @Test
    void fermerOffre_ChangesStatutToFermee() {
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(offreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Optional<OffreRecrutement> result = offreService.fermerOffre(1L);

        assertTrue(result.isPresent());
        assertEquals("FERMEE", result.get().getStatut());
    }

    // ─── Test 6 : Rouvrir une offre ───────────────────────────────────────────
    @Test
    void rouvrirOffre_ChangesStatutToOuverte() {
        offre.setStatut("FERMEE");
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        when(offreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Optional<OffreRecrutement> result = offreService.rouvrirOffre(1L);

        assertTrue(result.isPresent());
        assertEquals("OUVERTE", result.get().getStatut());
    }

    // ─── Test 7 : Supprimer une offre ────────────────────────────────────────
    @Test
    void deleteOffre_Success() {
        when(offreRepository.findById(1L)).thenReturn(Optional.of(offre));
        doNothing().when(offreRepository).delete(any());

        boolean result = offreService.deleteOffre(1L);

        assertTrue(result);
        verify(offreRepository, times(1)).delete(offre);
    }

    // ─── Test 8 : Supprimer offre inexistante ────────────────────────────────
    @Test
    void deleteOffre_NotFound_ReturnsFalse() {
        when(offreRepository.findById(99L)).thenReturn(Optional.empty());

        boolean result = offreService.deleteOffre(99L);

        assertFalse(result);
        verify(offreRepository, never()).delete(any());
    }

    // ─── Test 9 : Filtrer par statut ─────────────────────────────────────────
    @Test
    void getOffresByStatut_ReturnsFiltered() {
        when(offreRepository.findByStatut("OUVERTE")).thenReturn(List.of(offre));

        List<OffreRecrutement> result = offreService.getOffresByStatut("OUVERTE");

        assertEquals(1, result.size());
        assertEquals("OUVERTE", result.get(0).getStatut());
    }
}
