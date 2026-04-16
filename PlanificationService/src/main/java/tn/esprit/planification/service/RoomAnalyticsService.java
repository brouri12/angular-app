package tn.esprit.planification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.planification.dto.RoomAnalyticsSummaryDTO;
import tn.esprit.planification.dto.RoomUtilizationDTO;
import tn.esprit.planification.entity.Planification;
import tn.esprit.planification.entity.Salle;
import tn.esprit.planification.repository.PlanificationRepository;
import tn.esprit.planification.repository.SalleRepository;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomAnalyticsService {
    
    private final SalleRepository salleRepository;
    private final PlanificationRepository planificationRepository;
    
    private static final int WORKING_HOURS_PER_WEEK = 40; // 8 hours/day * 5 days
    
    @Transactional(readOnly = true)
    public RoomAnalyticsSummaryDTO getRoomAnalytics() {
        List<Salle> allRooms = salleRepository.findAll();
        
        // Get current week schedules
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = monday.plusDays(6);
        
        List<Planification> weekSchedules = planificationRepository.findByDateRange(monday, sunday);
        
        // Calculate utilization for each room
        List<RoomUtilizationDTO> roomUtilizations = allRooms.stream()
            .map(room -> calculateRoomUtilization(room, weekSchedules))
            .sorted(Comparator.comparing(RoomUtilizationDTO::getUtilizationPercentage).reversed())
            .collect(Collectors.toList());
        
        // Calculate overall statistics
        int totalRooms = allRooms.size();
        int activeRooms = (int) roomUtilizations.stream()
            .filter(r -> r.getTotalSchedules() > 0)
            .count();
        int underutilizedRooms = (int) roomUtilizations.stream()
            .filter(r -> "UNDERUTILIZED".equals(r.getStatus()))
            .count();
        double averageUtilization = roomUtilizations.stream()
            .mapToDouble(RoomUtilizationDTO::getUtilizationPercentage)
            .average()
            .orElse(0.0);
        
        // Analyze schedules by day
        Map<String, Integer> schedulesByDay = weekSchedules.stream()
            .collect(Collectors.groupingBy(
                p -> p.getDate().getDayOfWeek().toString(),
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        
        // Analyze schedules by time slot
        Map<String, Integer> schedulesByTimeSlot = weekSchedules.stream()
            .collect(Collectors.groupingBy(
                this::getTimeSlot,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        
        // Generate recommendations
        List<String> recommendations = generateRecommendations(roomUtilizations, averageUtilization);
        
        RoomAnalyticsSummaryDTO summary = new RoomAnalyticsSummaryDTO();
        summary.setTotalRooms(totalRooms);
        summary.setActiveRooms(activeRooms);
        summary.setUnderutilizedRooms(underutilizedRooms);
        summary.setAverageUtilization(Math.round(averageUtilization * 100.0) / 100.0);
        summary.setRoomUtilizations(roomUtilizations);
        summary.setSchedulesByDay(schedulesByDay);
        summary.setSchedulesByTimeSlot(schedulesByTimeSlot);
        summary.setRecommendations(recommendations);
        
        return summary;
    }
    
    private RoomUtilizationDTO calculateRoomUtilization(Salle room, List<Planification> weekSchedules) {
        // Filter schedules for this room
        List<Planification> roomSchedules = weekSchedules.stream()
            .filter(p -> p.getSalle() != null && p.getSalle().getIdSalle().equals(room.getIdSalle()))
            .collect(Collectors.toList());
        
        // Calculate total hours
        double totalHours = roomSchedules.stream()
            .mapToDouble(p -> Duration.between(p.getHeureDebut(), p.getHeureFin()).toMinutes() / 60.0)
            .sum();
        
        // Calculate utilization percentage
        double utilizationPercentage = (totalHours / WORKING_HOURS_PER_WEEK) * 100;
        
        // Find peak day
        String peakDay = roomSchedules.stream()
            .collect(Collectors.groupingBy(
                p -> p.getDate().getDayOfWeek().toString(),
                Collectors.counting()
            ))
            .entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");
        
        // Find peak time slot
        String peakTimeSlot = roomSchedules.stream()
            .collect(Collectors.groupingBy(
                this::getTimeSlot,
                Collectors.counting()
            ))
            .entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");
        
        // Determine status
        String status;
        if (utilizationPercentage < 30) {
            status = "UNDERUTILIZED";
        } else if (utilizationPercentage > 80) {
            status = "OVERUTILIZED";
        } else {
            status = "OPTIMAL";
        }
        
        RoomUtilizationDTO dto = new RoomUtilizationDTO();
        dto.setRoomId(room.getIdSalle());
        dto.setRoomName(room.getNomSalle());
        dto.setLocation(room.getLocalisation());
        dto.setCapacity(room.getCapacite());
        dto.setTotalSchedules(roomSchedules.size());
        dto.setHoursPerWeek(Math.round(totalHours * 100.0) / 100.0);
        dto.setUtilizationPercentage(Math.round(utilizationPercentage * 100.0) / 100.0);
        dto.setPeakDay(peakDay);
        dto.setPeakTimeSlot(peakTimeSlot);
        dto.setStatus(status);
        
        return dto;
    }
    
    private String getTimeSlot(Planification p) {
        int hour = p.getHeureDebut().getHour();
        if (hour < 12) {
            return "Morning (8-12)";
        } else if (hour < 17) {
            return "Afternoon (12-17)";
        } else {
            return "Evening (17-20)";
        }
    }
    
    private List<String> generateRecommendations(List<RoomUtilizationDTO> roomUtilizations, double averageUtilization) {
        List<String> recommendations = new ArrayList<>();
        
        // Check for underutilized rooms
        List<RoomUtilizationDTO> underutilized = roomUtilizations.stream()
            .filter(r -> "UNDERUTILIZED".equals(r.getStatus()))
            .collect(Collectors.toList());
        
        if (!underutilized.isEmpty()) {
            recommendations.add("You have " + underutilized.size() + " underutilized room(s). Consider scheduling more classes in: " +
                underutilized.stream()
                    .map(RoomUtilizationDTO::getRoomName)
                    .collect(Collectors.joining(", ")));
        }
        
        // Check for overutilized rooms
        List<RoomUtilizationDTO> overutilized = roomUtilizations.stream()
            .filter(r -> "OVERUTILIZED".equals(r.getStatus()))
            .collect(Collectors.toList());
        
        if (!overutilized.isEmpty()) {
            recommendations.add("Room(s) " + 
                overutilized.stream()
                    .map(RoomUtilizationDTO::getRoomName)
                    .collect(Collectors.joining(", ")) +
                " are heavily used. Consider redistributing some classes to other rooms.");
        }
        
        // Check overall utilization
        if (averageUtilization < 40) {
            recommendations.add("Overall room utilization is low (" + Math.round(averageUtilization) + "%). You may be able to consolidate classes into fewer rooms.");
        } else if (averageUtilization > 75) {
            recommendations.add("Overall room utilization is high (" + Math.round(averageUtilization) + "%). Consider adding more rooms or optimizing schedules.");
        } else {
            recommendations.add("Room utilization is well balanced at " + Math.round(averageUtilization) + "%.");
        }
        
        // Check for unused rooms
        List<RoomUtilizationDTO> unused = roomUtilizations.stream()
            .filter(r -> r.getTotalSchedules() == 0)
            .collect(Collectors.toList());
        
        if (!unused.isEmpty()) {
            recommendations.add("Room(s) " + 
                unused.stream()
                    .map(RoomUtilizationDTO::getRoomName)
                    .collect(Collectors.joining(", ")) +
                " have no scheduled classes this week.");
        }
        
        return recommendations;
    }
}
