package tn.esprit.planification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.planification.client.UserClient;
import tn.esprit.planification.dto.PlanificationDTO;
import tn.esprit.planification.entity.Group;
import tn.esprit.planification.entity.Planification;
import tn.esprit.planification.entity.Salle;
import tn.esprit.planification.exception.ResourceNotFoundException;
import tn.esprit.planification.exception.SchedulingConflictException;
import tn.esprit.planification.mapper.EntityMapper;
import tn.esprit.planification.repository.GroupRepository;
import tn.esprit.planification.repository.PlanificationRepository;
import tn.esprit.planification.repository.SalleRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanificationService {
    
    private final PlanificationRepository planificationRepository;
    private final SalleRepository salleRepository;
    private final GroupRepository groupRepository;
    private final EmailService emailService;
    private final UserClient userClient;
    
    @Transactional(readOnly = true)
    public List<PlanificationDTO> getAllPlanifications() {
        return planificationRepository.findAll().stream()
            .map(EntityMapper::toPlanificationDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PlanificationDTO getPlanificationById(Long id) {
        Planification planification = planificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        return EntityMapper.toPlanificationDTO(planification);
    }
    
    @Transactional
    public PlanificationDTO createPlanification(PlanificationDTO dto) {
        // Validate time
        if (dto.getHeureDebut().isAfter(dto.getHeureFin()) || dto.getHeureDebut().equals(dto.getHeureFin())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        
        // Get entities
        Salle salle = salleRepository.findById(dto.getSalleId())
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + dto.getSalleId()));
        
        Group group = groupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + dto.getGroupId()));
        
        // Check room availability
        boolean salleAvailable = salleRepository.isSalleAvailable(
            dto.getSalleId(), dto.getDate(), dto.getHeureDebut(), dto.getHeureFin()
        );
        if (!salleAvailable) {
            throw new SchedulingConflictException("Room is not available at this time");
        }
        
        // Check teacher availability
        if (group.getTeacherId() != null) {
            boolean teacherAvailable = planificationRepository.isTeacherAvailable(
                group.getTeacherId(), dto.getDate(), dto.getHeureDebut(), dto.getHeureFin()
            );
            if (!teacherAvailable) {
                throw new SchedulingConflictException("Teacher is not available at this time");
            }
        }
        
        // Create planification
        Planification planification = new Planification();
        planification.setTitre(dto.getTitre());
        planification.setType(dto.getType());
        planification.setDate(dto.getDate());
        planification.setHeureDebut(dto.getHeureDebut());
        planification.setHeureFin(dto.getHeureFin());
        planification.setSalle(salle);
        planification.setGroup(group);
        
        Planification savedPlanification = planificationRepository.save(planification);
        
        // Send email notifications to all students in the group
        sendEmailNotificationsToStudents(savedPlanification, group, salle);
        
        return EntityMapper.toPlanificationDTO(savedPlanification);
    }
    
    private void sendEmailNotificationsToStudents(Planification planification, Group group, Salle salle) {
        if (group.getStudentIds() == null || group.getStudentIds().isEmpty()) {
            return;
        }
        
        String scheduleDetails = formatScheduleDetails(planification, salle, group);
        
        for (Long studentId : group.getStudentIds()) {
            try {
                UserClient.UserDTO student = userClient.getUserById(studentId);
                if (student != null && student.getEmail() != null) {
                    emailService.sendScheduleNotification(
                        student.getEmail(),
                        student.getFullName(),
                        scheduleDetails
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send email to student " + studentId + ": " + e.getMessage());
            }
        }
    }
    
    private String formatScheduleDetails(Planification planification, Salle salle, Group group) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        return String.format("""
            Schedule Details:
            ----------------
            Title: %s
            Type: %s
            Date: %s
            Time: %s - %s
            Room: %s (Location: %s)
            Group Level: %s
            """,
            planification.getTitre(),
            planification.getType(),
            planification.getDate().format(dateFormatter),
            planification.getHeureDebut().format(timeFormatter),
            planification.getHeureFin().format(timeFormatter),
            salle.getNomSalle(),
            salle.getLocalisation(),
            group.getLevel()
        );
    }
    
    @Transactional
    public PlanificationDTO updatePlanification(Long id, PlanificationDTO dto) {
        Planification existingPlanification = planificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        
        // Validate time
        if (dto.getHeureDebut().isAfter(dto.getHeureFin()) || dto.getHeureDebut().equals(dto.getHeureFin())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        
        // Get entities
        Salle salle = salleRepository.findById(dto.getSalleId())
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + dto.getSalleId()));
        
        Group group = groupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + dto.getGroupId()));
        
        // Check room availability (excluding current schedule)
        List<Planification> conflicts = planificationRepository.findBySalleAndDateAndTimeOverlap(
            dto.getSalleId(), dto.getDate(), dto.getHeureDebut(), dto.getHeureFin()
        );
        // Remove the current planification from conflicts
        conflicts = conflicts.stream()
            .filter(p -> !p.getIdPlanification().equals(id))
            .collect(Collectors.toList());
        
        if (!conflicts.isEmpty()) {
            throw new SchedulingConflictException("Room is not available at this time");
        }
        
        // Check teacher availability (excluding current schedule)
        if (group.getTeacherId() != null) {
            List<Planification> teacherConflicts = planificationRepository.findByTeacherAndDateAndTimeOverlap(
                group.getTeacherId(), dto.getDate(), dto.getHeureDebut(), dto.getHeureFin()
            );
            teacherConflicts = teacherConflicts.stream()
                .filter(p -> !p.getIdPlanification().equals(id))
                .collect(Collectors.toList());
            
            if (!teacherConflicts.isEmpty()) {
                throw new SchedulingConflictException("Teacher is not available at this time");
            }
        }
        
        // Update fields
        existingPlanification.setTitre(dto.getTitre());
        existingPlanification.setType(dto.getType());
        existingPlanification.setDate(dto.getDate());
        existingPlanification.setHeureDebut(dto.getHeureDebut());
        existingPlanification.setHeureFin(dto.getHeureFin());
        existingPlanification.setSalle(salle);
        existingPlanification.setGroup(group);
        
        Planification updatedPlanification = planificationRepository.save(existingPlanification);
        return EntityMapper.toPlanificationDTO(updatedPlanification);
    }
    
    @Transactional
    public void deletePlanification(Long id) {
        if (!planificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Schedule not found with id: " + id);
        }
        planificationRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<PlanificationDTO> getPlanificationsByDate(LocalDate date) {
        return planificationRepository.findByDate(date).stream()
            .map(EntityMapper::toPlanificationDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<PlanificationDTO> getPlanificationsByDateRange(LocalDate startDate, LocalDate endDate) {
        return planificationRepository.findByDateRange(startDate, endDate).stream()
            .map(EntityMapper::toPlanificationDTO)
            .collect(Collectors.toList());
    }
}
