package tn.esprit.planification.mapper;

import tn.esprit.planification.dto.*;
import tn.esprit.planification.entity.*;

import java.util.stream.Collectors;

public class EntityMapper {
    
    // Salle mappings
    public static SalleDTO toSalleDTO(Salle salle) {
        if (salle == null) return null;
        return new SalleDTO(
            salle.getIdSalle(),
            salle.getNomSalle(),
            salle.getCapacite(),
            salle.getLocalisation()
        );
    }
    
    public static Salle toSalleEntity(SalleDTO dto) {
        if (dto == null) return null;
        return new Salle(
            dto.getIdSalle(),
            dto.getNomSalle(),
            dto.getCapacite(),
            dto.getLocalisation()
        );
    }
    // Group mappings
    public static GroupDTO toGroupDTO(Group group) {
        if (group == null) return null;
        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setLevel(group.getLevel());
        dto.setStudentIds(group.getStudentIds() != null ? new java.util.ArrayList<>(group.getStudentIds()) : new java.util.ArrayList<>());
        dto.setTeacherId(group.getTeacherId());
        return dto;
    }
    
    // Planification mappings
    public static PlanificationDTO toPlanificationDTO(Planification planification) {
        if (planification == null) return null;
        return new PlanificationDTO(
            planification.getIdPlanification(),
            planification.getTitre(),
            planification.getType(),
            planification.getDate(),
            planification.getHeureDebut(),
            planification.getHeureFin(),
            planification.getSalle().getIdSalle(),
            planification.getSalle().getNomSalle(),
            planification.getGroup().getId(),
            planification.getGroup().getLevel().toString()
        );
    }
}
