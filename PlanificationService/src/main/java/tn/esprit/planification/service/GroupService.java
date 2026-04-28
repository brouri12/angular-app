package tn.esprit.planification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.planification.dto.GroupDTO;
import tn.esprit.planification.entity.Group;
import tn.esprit.planification.exception.ResourceNotFoundException;
import tn.esprit.planification.mapper.EntityMapper;
import tn.esprit.planification.repository.GroupRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    
    private final GroupRepository groupRepository;
    
    @Transactional(readOnly = true)
    public List<GroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
            .map(EntityMapper::toGroupDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public GroupDTO getGroupById(Long id) {
        Group group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + id));
        return EntityMapper.toGroupDTO(group);
    }
    
    @Transactional
    public GroupDTO createGroup(GroupDTO groupDTO) {
        Group group = new Group();
        group.setLevel(groupDTO.getLevel());
        
        // Set teacher if provided
        if (groupDTO.getTeacherId() != null) {
            group.setTeacherId(groupDTO.getTeacherId());
        }
        
        // Set students if provided
        if (groupDTO.getStudentIds() != null && !groupDTO.getStudentIds().isEmpty()) {
            group.setStudentIds(new ArrayList<>(groupDTO.getStudentIds()));
        }
        
        Group savedGroup = groupRepository.save(group);
        return EntityMapper.toGroupDTO(savedGroup);
    }
    
    @Transactional
    public GroupDTO assignTeacherToGroup(Long groupId, Long teacherId) {
        try {
            System.out.println("=== ASSIGN TEACHER DEBUG ===");
            System.out.println("Group ID: " + groupId);
            System.out.println("Teacher ID: " + teacherId);
            
            // Verify group exists
            if (!groupRepository.existsById(groupId)) {
                throw new ResourceNotFoundException("Group not found with id: " + groupId);
            }
            System.out.println("Group exists: YES");
            
            // Use custom query to update only teacher_id field
            groupRepository.updateTeacherId(groupId, teacherId);
            System.out.println("Update query executed");
            
            // Fetch updated group
            Group updatedGroup = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found after update"));
            System.out.println("Fetched updated group: " + updatedGroup.getId());
            System.out.println("Teacher ID in group: " + updatedGroup.getTeacherId());
            
            GroupDTO result = EntityMapper.toGroupDTO(updatedGroup);
            System.out.println("=== ASSIGN TEACHER SUCCESS ===");
            return result;
        } catch (Exception e) {
            System.err.println("=== ASSIGN TEACHER ERROR ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to assign teacher: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public GroupDTO addStudentToGroup(Long groupId, Long studentId) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));
        
        if (!group.getStudentIds().contains(studentId)) {
            group.getStudentIds().add(studentId);
        }
        groupRepository.save(group);
        
        return EntityMapper.toGroupDTO(group);
    }
    
    @Transactional
    public GroupDTO assignStudentsToGroup(Long groupId, List<Long> studentIds) {
        Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));
            
        for (Long studentId : studentIds) {
            if (!group.getStudentIds().contains(studentId)) {
                group.getStudentIds().add(studentId);
            }
        }
        
        groupRepository.save(group);
        return EntityMapper.toGroupDTO(group);
    }
    
    @Transactional
    public void deleteGroup(Long id) {
        if (!groupRepository.existsById(id)) {
            throw new ResourceNotFoundException("Group not found with id: " + id);
        }
        groupRepository.deleteById(id);
    }
}
