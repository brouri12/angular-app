package tn.esprit.planification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAnalyticsSummaryDTO {
    // Overall statistics
    private Integer totalRooms;
    private Integer activeRooms;
    private Integer underutilizedRooms;
    private Double averageUtilization;
    
    // Room details
    private List<RoomUtilizationDTO> roomUtilizations;
    
    // Peak times across all rooms
    private Map<String, Integer> schedulesByDay;
    private Map<String, Integer> schedulesByTimeSlot;
    
    // Recommendations
    private List<String> recommendations;
}
