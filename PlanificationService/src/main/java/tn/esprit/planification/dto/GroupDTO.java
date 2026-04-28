package tn.esprit.planification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.planification.enums.StudentLevel;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    
    private Long id;
    
    @NotNull(message = "Group level is required")
    private StudentLevel level;
    
    private List<Long> studentIds;
    
    private Long teacherId;
}
