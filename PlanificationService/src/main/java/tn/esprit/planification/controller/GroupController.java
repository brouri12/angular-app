package tn.esprit.planification.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.planification.dto.GroupDTO;
import tn.esprit.planification.service.GroupService;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    
    private final GroupService groupService;
    
    @GetMapping
    public ResponseEntity<List<GroupDTO>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }
    
    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@Valid @RequestBody GroupDTO groupDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(groupDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{groupId}/teacher/{teacherId}")
    public ResponseEntity<GroupDTO> assignTeacherToGroup(@PathVariable Long groupId, @PathVariable Long teacherId) {
        try {
            GroupDTO result = groupService.assignTeacherToGroup(groupId, teacherId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // This will print the error to console
            throw e;
        }
    }
    
    @PostMapping("/{groupId}/student/{studentId}")
    public ResponseEntity<GroupDTO> addStudentToGroup(@PathVariable Long groupId, @PathVariable Long studentId) {
        return ResponseEntity.ok(groupService.addStudentToGroup(groupId, studentId));
    }
    
    @PostMapping("/{groupId}/students")
    public ResponseEntity<GroupDTO> assignStudentsToGroup(@PathVariable Long groupId, @RequestBody List<Long> studentIds) {
        return ResponseEntity.ok(groupService.assignStudentsToGroup(groupId, studentIds));
    }
}
