package tn.esprit.planification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUtilizationDTO {
    private Long roomId;
    private String roomName;
    private String location;
    private Integer capacity;
    
    // Utilization metrics
    private Integer totalSchedules;
    private Double hoursPerWeek;
    private Double utilizationPercentage;
    
    // Peak usage
    private String peakDay;
    private String peakTimeSlot;
    
    // Status
    private String status; // UNDERUTILIZED, OPTIMAL, OVERUTILIZED
}
