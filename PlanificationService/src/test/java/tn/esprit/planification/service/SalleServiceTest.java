package tn.esprit.planification.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.planification.dto.SalleDTO;
import tn.esprit.planification.entity.Salle;
import tn.esprit.planification.exception.ResourceNotFoundException;
import tn.esprit.planification.repository.PlanificationRepository;
import tn.esprit.planification.repository.SalleRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SalleService Unit Tests")
class SalleServiceTest {

    @Mock
    private SalleRepository salleRepository;

    @Mock
    private PlanificationRepository planificationRepository;

    @InjectMocks
    private SalleService salleService;

    private Salle testSalle;
    private SalleDTO testSalleDTO;

    @BeforeEach
    void setUp() {
        // Setup test room
        testSalle = new Salle();
        testSalle.setIdSalle(1L);
        testSalle.setNomSalle("A-101");
        testSalle.setCapacite(30);
        testSalle.setLocalisation("Building A, Floor 1");

        // Setup test DTO
        testSalleDTO = new SalleDTO();
        testSalleDTO.setIdSalle(1L);
        testSalleDTO.setNomSalle("A-101");
        testSalleDTO.setCapacite(30);
        testSalleDTO.setLocalisation("Building A, Floor 1");
    }

    // ==================== GET ALL SALLES ====================

    @Test
    @DisplayName("Should return all rooms")
    void testGetAllSalles() {
        // Given
        List<Salle> salles = Arrays.asList(testSalle);
        when(salleRepository.findAll()).thenReturn(salles);

        // When
        List<SalleDTO> result = salleService.getAllSalles();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("A-101", result.get(0).getNomSalle());
        assertEquals(30, result.get(0).getCapacite());
        verify(salleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no rooms exist")
    void testGetAllSalles_EmptyList() {
        // Given
        when(salleRepository.findAll()).thenReturn(new ArrayList<>());

        // When
        List<SalleDTO> result = salleService.getAllSalles();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(salleRepository, times(1)).findAll();
    }

    // ==================== GET SALLE BY ID ====================

    @Test
    @DisplayName("Should return room by ID")
    void testGetSalleById_Success() {
        // Given
        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));

        // When
        SalleDTO result = salleService.getSalleById(1L);

        // Then
        assertNotNull(result);
        assertEquals("A-101", result.getNomSalle());
        assertEquals(30, result.getCapacite());
        assertEquals("Building A, Floor 1", result.getLocalisation());
        verify(salleRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when room not found")
    void testGetSalleById_NotFound() {
        // Given
        when(salleRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            salleService.getSalleById(999L);
        });
        verify(salleRepository, times(1)).findById(999L);
    }

    // ==================== CREATE SALLE ====================

    @Test
    @DisplayName("Should create room successfully")
    void testCreateSalle_Success() {
        // Given
        when(salleRepository.save(any(Salle.class))).thenReturn(testSalle);

        // When
        SalleDTO result = salleService.createSalle(testSalleDTO);

        // Then
        assertNotNull(result);
        assertEquals("A-101", result.getNomSalle());
        assertEquals(30, result.getCapacite());
        verify(salleRepository, times(1)).save(any(Salle.class));
    }

    @Test
    @DisplayName("Should create room with minimum data")
    void testCreateSalle_MinimalData() {
        // Given
        SalleDTO minimalDTO = new SalleDTO();
        minimalDTO.setNomSalle("B-202");
        minimalDTO.setCapacite(20);
        
        Salle minimalSalle = new Salle();
        minimalSalle.setIdSalle(2L);
        minimalSalle.setNomSalle("B-202");
        minimalSalle.setCapacite(20);
        
        when(salleRepository.save(any(Salle.class))).thenReturn(minimalSalle);

        // When
        SalleDTO result = salleService.createSalle(minimalDTO);

        // Then
        assertNotNull(result);
        assertEquals("B-202", result.getNomSalle());
        assertEquals(20, result.getCapacite());
        verify(salleRepository, times(1)).save(any(Salle.class));
    }

    // ==================== UPDATE SALLE ====================

    @Test
    @DisplayName("Should update room successfully")
    void testUpdateSalle_Success() {
        // Given
        SalleDTO updatedDTO = new SalleDTO();
        updatedDTO.setNomSalle("A-101-Updated");
        updatedDTO.setCapacite(35);
        updatedDTO.setLocalisation("Building A, Floor 1, Room 101");

        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));
        when(salleRepository.save(any(Salle.class))).thenReturn(testSalle);

        // When
        SalleDTO result = salleService.updateSalle(1L, updatedDTO);

        // Then
        assertNotNull(result);
        verify(salleRepository, times(1)).findById(1L);
        verify(salleRepository, times(1)).save(testSalle);
        assertEquals("A-101-Updated", testSalle.getNomSalle());
        assertEquals(35, testSalle.getCapacite());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent room")
    void testUpdateSalle_NotFound() {
        // Given
        when(salleRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            salleService.updateSalle(999L, testSalleDTO);
        });
        verify(salleRepository, times(1)).findById(999L);
        verify(salleRepository, never()).save(any());
    }

    // ==================== DELETE SALLE ====================

    @Test
    @DisplayName("Should delete room successfully")
    void testDeleteSalle_Success() {
        // Given
        when(salleRepository.existsById(1L)).thenReturn(true);
        doNothing().when(salleRepository).deleteById(1L);

        // When
        salleService.deleteSalle(1L);

        // Then
        verify(salleRepository, times(1)).existsById(1L);
        verify(salleRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent room")
    void testDeleteSalle_NotFound() {
        // Given
        when(salleRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            salleService.deleteSalle(999L);
        });
        verify(salleRepository, times(1)).existsById(999L);
        verify(salleRepository, never()).deleteById(anyLong());
    }

    // ==================== CHECK AVAILABILITY ====================

    @Test
    @DisplayName("Should return true when room is available")
    void testIsSalleAvailable_Available() {
        // Given
        LocalDate date = LocalDate.of(2026, 4, 15);
        LocalTime startTime = LocalTime.of(10, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        when(salleRepository.existsById(1L)).thenReturn(true);
        when(salleRepository.isSalleAvailable(1L, date, startTime, endTime)).thenReturn(true);

        // When
        boolean result = salleService.isSalleAvailable(1L, date, startTime, endTime);

        // Then
        assertTrue(result);
        verify(salleRepository, times(1)).existsById(1L);
        verify(salleRepository, times(1)).isSalleAvailable(1L, date, startTime, endTime);
    }

    @Test
    @DisplayName("Should return false when room is not available")
    void testIsSalleAvailable_NotAvailable() {
        // Given
        LocalDate date = LocalDate.of(2026, 4, 15);
        LocalTime startTime = LocalTime.of(10, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        when(salleRepository.existsById(1L)).thenReturn(true);
        when(salleRepository.isSalleAvailable(1L, date, startTime, endTime)).thenReturn(false);

        // When
        boolean result = salleService.isSalleAvailable(1L, date, startTime, endTime);

        // Then
        assertFalse(result);
        verify(salleRepository, times(1)).existsById(1L);
        verify(salleRepository, times(1)).isSalleAvailable(1L, date, startTime, endTime);
    }

    @Test
    @DisplayName("Should throw exception when checking availability of non-existent room")
    void testIsSalleAvailable_RoomNotFound() {
        // Given
        LocalDate date = LocalDate.of(2026, 4, 15);
        LocalTime startTime = LocalTime.of(10, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        when(salleRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            salleService.isSalleAvailable(999L, date, startTime, endTime);
        });
        verify(salleRepository, times(1)).existsById(999L);
        verify(salleRepository, never()).isSalleAvailable(anyLong(), any(), any(), any());
    }

    // ==================== GET BY CAPACITY ====================

    @Test
    @DisplayName("Should return rooms with minimum capacity")
    void testGetSallesByCapacity_Success() {
        // Given
        Salle largeSalle = new Salle();
        largeSalle.setIdSalle(2L);
        largeSalle.setNomSalle("B-202");
        largeSalle.setCapacite(50);
        largeSalle.setLocalisation("Building B, Floor 2");

        List<Salle> salles = Arrays.asList(testSalle, largeSalle);
        when(salleRepository.findByCapaciteGreaterThanEqual(30)).thenReturn(salles);

        // When
        List<SalleDTO> result = salleService.getSallesByCapacity(30);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(s -> s.getCapacite() >= 30));
        verify(salleRepository, times(1)).findByCapaciteGreaterThanEqual(30);
    }

    @Test
    @DisplayName("Should return empty list when no rooms meet capacity requirement")
    void testGetSallesByCapacity_NoResults() {
        // Given
        when(salleRepository.findByCapaciteGreaterThanEqual(100)).thenReturn(new ArrayList<>());

        // When
        List<SalleDTO> result = salleService.getSallesByCapacity(100);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(salleRepository, times(1)).findByCapaciteGreaterThanEqual(100);
    }

    @Test
    @DisplayName("Should return all rooms when capacity is zero")
    void testGetSallesByCapacity_ZeroCapacity() {
        // Given
        List<Salle> allSalles = Arrays.asList(testSalle);
        when(salleRepository.findByCapaciteGreaterThanEqual(0)).thenReturn(allSalles);

        // When
        List<SalleDTO> result = salleService.getSallesByCapacity(0);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(salleRepository, times(1)).findByCapaciteGreaterThanEqual(0);
    }
}
