package tn.esprit.planification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.planification.client.UserClient;
import tn.esprit.planification.entity.Group;
import tn.esprit.planification.entity.Planification;
import tn.esprit.planification.entity.Salle;
import tn.esprit.planification.repository.PlanificationRepository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {
    
    private final PlanificationRepository planificationRepository;
    private final UserClient userClient;
    
    private static final DateTimeFormatter ICAL_DATE_FORMAT = 
        DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
    
    public String generateICalForStudent(Long studentId) {
        // Get all schedules for this student
        List<Planification> schedules = planificationRepository.findAll().stream()
            .filter(p -> p.getGroup() != null && 
                        p.getGroup().getStudentIds() != null &&
                        p.getGroup().getStudentIds().contains(studentId))
            .collect(Collectors.toList());
        
        // Get student info
        UserClient.UserDTO student = userClient.getUserById(studentId);
        String studentName = student != null ? student.getFullName() : "Student";
        
        return buildICalendar(schedules, studentName);
    }
    
    public String generateICalForTeacher(Long teacherId) {
        // Get all schedules for this teacher
        List<Planification> schedules = planificationRepository.findAll().stream()
            .filter(p -> p.getGroup() != null && 
                        p.getGroup().getTeacherId() != null &&
                        p.getGroup().getTeacherId().equals(teacherId))
            .collect(Collectors.toList());
        
        // Get teacher info
        UserClient.UserDTO teacher = userClient.getUserById(teacherId);
        String teacherName = teacher != null ? teacher.getFullName() : "Teacher";
        
        return buildICalendar(schedules, teacherName);
    }
    
    public String generateICalForGroup(Long groupId) {
        // Get all schedules for this group
        List<Planification> schedules = planificationRepository.findAll().stream()
            .filter(p -> p.getGroup() != null && 
                        p.getGroup().getId() != null &&
                        p.getGroup().getId().equals(groupId))
            .collect(Collectors.toList());
        
        return buildICalendar(schedules, "Group Schedule");
    }
    
    private String buildICalendar(List<Planification> schedules, String calendarName) {
        StringBuilder ical = new StringBuilder();
        
        // iCalendar header
        ical.append("BEGIN:VCALENDAR\r\n");
        ical.append("VERSION:2.0\r\n");
        ical.append("PRODID:-//Wordly Language School//Schedule//EN\r\n");
        ical.append("CALSCALE:GREGORIAN\r\n");
        ical.append("METHOD:PUBLISH\r\n");
        ical.append("X-WR-CALNAME:").append(escapeText(calendarName)).append("\r\n");
        ical.append("X-WR-TIMEZONE:Africa/Tunis\r\n");
        
        // Add each schedule as an event
        for (Planification schedule : schedules) {
            ical.append(buildEvent(schedule));
        }
        
        // iCalendar footer
        ical.append("END:VCALENDAR\r\n");
        
        return ical.toString();
    }
    
    private String buildEvent(Planification schedule) {
        StringBuilder event = new StringBuilder();
        
        // Combine date and time
        LocalDateTime startDateTime = LocalDateTime.of(
            schedule.getDate(), 
            schedule.getHeureDebut()
        );
        LocalDateTime endDateTime = LocalDateTime.of(
            schedule.getDate(), 
            schedule.getHeureFin()
        );
        
        // Event details
        Group group = schedule.getGroup();
        Salle salle = schedule.getSalle();
        
        String summary = schedule.getTitre();
        String description = buildDescription(schedule, group);
        String location = salle != null ? 
            salle.getNomSalle() + " - " + salle.getLocalisation() : "";
        
        // Generate unique ID
        String uid = "schedule-" + schedule.getIdPlanification() + "@wordly.tn";
        
        // Build event
        event.append("BEGIN:VEVENT\r\n");
        event.append("UID:").append(uid).append("\r\n");
        event.append("DTSTAMP:").append(formatDateTime(LocalDateTime.now())).append("\r\n");
        event.append("DTSTART:").append(formatDateTime(startDateTime)).append("\r\n");
        event.append("DTEND:").append(formatDateTime(endDateTime)).append("\r\n");
        event.append("SUMMARY:").append(escapeText(summary)).append("\r\n");
        event.append("DESCRIPTION:").append(escapeText(description)).append("\r\n");
        event.append("LOCATION:").append(escapeText(location)).append("\r\n");
        event.append("STATUS:CONFIRMED\r\n");
        event.append("SEQUENCE:0\r\n");
        event.append("END:VEVENT\r\n");
        
        return event.toString();
    }
    
    private String buildDescription(Planification schedule, Group group) {
        StringBuilder desc = new StringBuilder();
        desc.append("Type: ").append(schedule.getType()).append("\\n");
        desc.append("Level: ").append(group != null ? group.getLevel() : "N/A").append("\\n");
        
        if (schedule.getSalle() != null) {
            desc.append("Room: ").append(schedule.getSalle().getNomSalle()).append("\\n");
            desc.append("Capacity: ").append(schedule.getSalle().getCapacite()).append("\\n");
        }
        
        desc.append("\\nWordly Language School");
        
        return desc.toString();
    }
    
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(ICAL_DATE_FORMAT);
    }
    
    private String escapeText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace(",", "\\,")
                   .replace(";", "\\;")
                   .replace("\n", "\\n");
    }
}
