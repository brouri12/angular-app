package tn.esprit.planification.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.planification.client.UserClient;
import tn.esprit.planification.dto.PlanificationDTO;
import tn.esprit.planification.entity.Group;
import tn.esprit.planification.entity.Planification;
import tn.esprit.planification.entity.Salle;
import tn.esprit.planification.enums.PlanificationType;
import tn.esprit.planification.enums.StudentLevel;
import tn.esprit.planification.exception.ResourceNotFoundException;
import tn.esprit.planification.exception.SchedulingConflictException;
import tn.esprit.planification.repository.GroupRepository;
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
@DisplayName("PlanificationService Unit Tests")
class PlanificationServiceTest {

    @Mock
    private PlanificationRepository planificationRepository;

    @Mock
    private SalleRepository salleRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private UserClient userClient;

    @InjectMocks
    private PlanificationService planificationService;

    private Salle testSalle;
    private Group testGroup;
    private Planification testPlanification;
    private PlanificationDTO testPlanificationDTO;

    @BeforeEach
    void setUp() {
        // Setup test data
        testSalle = new Salle();
        testSalle.setIdSalle(1L);
        testSalle.setNomSalle("A-101");
        testSalle.setCapacite(30);
        testSalle.setLocalisation("Building A, Floor 1");

        testGroup = new Group();
        testGroup.setId(1L);
        testGroup.setLevel(StudentLevel.INTERMEDIATE);
        testGroup.setTeacherId(10L);
        testGroup.setStudentIds(Arrays.asList(1L, 2L, 3L));

        testPlanification = new Planification();
        testPlanification.setIdPlanification(1L);
        testPlanification.setTitre("English Class");
        testPlanification.setType(PlanificationType.COURS);
        testPlanification.setDate(LocalDate.of(2026, 4, 15));
        testPlanification.setHeureDebut(LocalTime.of(10, 0));
        testPlanification.setHeureFin(LocalTime.of(12, 0));
        testPlanification.setSalle(testSalle);
        testPlanification.setGroup(testGroup);

        testPlanificationDTO = new PlanificationDTO();
        testPlanificationDTO.setTitre("English Class");
        testPlanificationDTO.setType(PlanificationType.COURS);
        testPlanificationDTO.setDate(LocalDate.of(2026, 4, 15));
        testPlanificationDTO.setHeureDebut(LocalTime.of(10, 0));
        testPlanificationDTO.setHeureFin(LocalTime.of(12, 0));
        testPlanificationDTO.setSalleId(1L);
        testPlanificationDTO.setGroupId(1L);
    }

    // ==================== GET ALL PLANIFICATIONS ====================

    @Test
    @DisplayName("Should return all planifications")
    void testGetAllPlanifications() {
        // Given
        List<Planification> planifications = Arrays.asList(testPlanification);
        when(planificationRepository.findAll()).thenReturn(planifications);

        // When
        List<PlanificationDTO> result = planificationService.getAllPlanifications();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("English Class", result.get(0).getTitre());
        verify(planificationRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no planifications exist")
    void testGetAllPlanifications_EmptyList() {
        // Given
        when(planificationRepository.findAll()).thenReturn(new ArrayList<>());

        // When
        List<PlanificationDTO> result = planificationService.getAllPlanifications();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(planificationRepository, times(1)).findAll();
    }

    // ==================== GET PLANIFICATION BY ID ====================

    @Test
    @DisplayName("Should return planification by ID")
    void testGetPlanificationById_Success() {
        // Given
        when(planificationRepository.findById(1L)).thenReturn(Optional.of(testPlanification));

        // When
        PlanificationDTO result = planificationService.getPlanificationById(1L);

        // Then
        assertNotNull(result);
        assertEquals("English Class", result.getTitre());
        assertEquals(PlanificationType.COURS, result.getType());
        verify(planificationRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when planification not found")
    void testGetPlanificationById_NotFound() {
        // Given
        when(planificationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            planificationService.getPlanificationById(999L);
        });
        verify(planificationRepository, times(1)).findById(999L);
    }

    // ==================== CREATE PLANIFICATION ====================

    @Test
    @DisplayName("Should create planification successfully")
    void testCreatePlanification_Success() {
        // Given
        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(salleRepository.isSalleAvailable(anyLong(), any(), any(), any())).thenReturn(true);
        when(planificationRepository.isTeacherAvailable(anyLong(), any(), any(), any())).thenReturn(true);
        when(planificationRepository.save(any(Planification.class))).thenReturn(testPlanification);

        // When
        PlanificationDTO result = planificationService.createPlanification(testPlanificationDTO);

        // Then
        assertNotNull(result);
        assertEquals("English Class", result.getTitre());
        verify(salleRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).findById(1L);
        verify(salleRepository, times(1)).isSalleAvailable(anyLong(), any(), any(), any());
        verify(planificationRepository, times(1)).isTeacherAvailable(anyLong(), any(), any(), any());
        verify(planificationRepository, times(1)).save(any(Planification.class));
    }

    @Test
    @DisplayName("Should throw exception when start time is after end time")
    void testCreatePlanification_InvalidTimeRange() {
        // Given
        testPlanificationDTO.setHeureDebut(LocalTime.of(14, 0));
        testPlanificationDTO.setHeureFin(LocalTime.of(12, 0));

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            planificationService.createPlanification(testPlanificationDTO);
        });
        verify(planificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when start time equals end time")
    void testCreatePlanification_EqualTimes() {
        // Given
        testPlanificationDTO.setHeureDebut(LocalTime.of(10, 0));
        testPlanificationDTO.setHeureFin(LocalTime.of(10, 0));

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            planificationService.createPlanification(testPlanificationDTO);
        });
        verify(planificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when salle not found")
    void testCreatePlanification_SalleNotFound() {
        // Given
        when(salleRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            planificationService.createPlanification(testPlanificationDTO);
        });
        verify(planificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when group not found")
    void testCreatePlanification_GroupNotFound() {
        // Given
        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));
        when(groupRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            planificationService.createPlanification(testPlanificationDTO);
        });
        verify(planificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw SchedulingConflictException when room is not available")
    void testCreatePlanification_RoomConflict() {
        // Given
        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(salleRepository.isSalleAvailable(anyLong(), any(), any(), any())).thenReturn(false);

        // When & Then
        assertThrows(SchedulingConflictException.class, () -> {
            planificationService.createPlanification(testPlanificationDTO);
        });
        verify(planificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw SchedulingConflictException when teacher is not available")
    void testCreatePlanification_TeacherConflict() {
        // Given
        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(salleRepository.isSalleAvailable(anyLong(), any(), any(), any())).thenReturn(true);
        when(planificationRepository.isTeacherAvailable(anyLong(), any(), any(), any())).thenReturn(false);

        // When & Then
        assertThrows(SchedulingConflictException.class, () -> {
            planificationService.createPlanification(testPlanificationDTO);
        });
        verify(planificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should create planification when group has no teacher")
    void testCreatePlanification_NoTeacher() {
        // Given
        testGroup.setTeacherId(null);
        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(salleRepository.isSalleAvailable(anyLong(), any(), any(), any())).thenReturn(true);
        when(planificationRepository.save(any(Planification.class))).thenReturn(testPlanification);

        // When
        PlanificationDTO result = planificationService.createPlanification(testPlanificationDTO);

        // Then
        assertNotNull(result);
        verify(planificationRepository, never()).isTeacherAvailable(anyLong(), any(), any(), any());
        verify(planificationRepository, times(1)).save(any(Planification.class));
    }

    // ==================== UPDATE PLANIFICATION ====================

    @Test
    @DisplayName("Should update planification successfully")
    void testUpdatePlanification_Success() {
        // Given
        when(planificationRepository.findById(1L)).thenReturn(Optional.of(testPlanification));
        when(salleRepository.findById(1L)).thenReturn(Optional.of(testSalle));
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(planificationRepository.findBySalleAndDateAndTimeOverlap(anyLong(), any(), any(), any()))
            .thenReturn(new ArrayList<>());
        when(planificationRepository.findByTeacherAndDateAndTimeOverlap(anyLong(), any(), any(), any()))
            .thenReturn(new ArrayList<>());
        when(planificationRepository.save(any(Planification.class))).thenReturn(testPlanification);

        // When
        PlanificationDTO result = planificationService.updatePlanification(1L, testPlanificationDTO);

        // Then
        assertNotNull(result);
        verify(planificationRepository, times(1)).findById(1L);
        verify(planificationRepository, times(1)).save(any(Planification.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent planification")
    void testUpdatePlanification_NotFound() {
        // Given
        when(planificationRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            planificationService.updatePlanification(999L, testPlanificationDTO);
        });
        verify(planificationRepository, never()).save(any());
    }

    // ==================== DELETE PLANIFICATION ====================

    @Test
    @DisplayName("Should delete planification successfully")
    void testDeletePlanification_Success() {
        // Given
        when(planificationRepository.existsById(1L)).thenReturn(true);
        doNothing().when(planificationRepository).deleteById(1L);

        // When
        planificationService.deletePlanification(1L);

        // Then
        verify(planificationRepository, times(1)).existsById(1L);
        verify(planificationRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent planification")
    void testDeletePlanification_NotFound() {
        // Given
        when(planificationRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            planificationService.deletePlanification(999L);
        });
        verify(planificationRepository, never()).deleteById(anyLong());
    }

    // ==================== GET BY DATE ====================

    @Test
    @DisplayName("Should return planifications by date")
    void testGetPlanificationsByDate() {
        // Given
        LocalDate testDate = LocalDate.of(2026, 4, 15);
        List<Planification> planifications = Arrays.asList(testPlanification);
        when(planificationRepository.findByDate(testDate)).thenReturn(planifications);

        // When
        List<PlanificationDTO> result = planificationService.getPlanificationsByDate(testDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(planificationRepository, times(1)).findByDate(testDate);
    }

    // ==================== GET BY DATE RANGE ====================

    @Test
    @DisplayName("Should return planifications by date range")
    void testGetPlanificationsByDateRange() {
        // Given
        LocalDate startDate = LocalDate.of(2026, 4, 1);
        LocalDate endDate = LocalDate.of(2026, 4, 30);
        List<Planification> planifications = Arrays.asList(testPlanification);
        when(planificationRepository.findByDateRange(startDate, endDate)).thenReturn(planifications);

        // When
        List<PlanificationDTO> result = planificationService.getPlanificationsByDateRange(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(planificationRepository, times(1)).findByDateRange(startDate, endDate);
    }
}
