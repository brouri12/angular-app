package tn.esprit.planification.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.planification.dto.GroupDTO;
import tn.esprit.planification.entity.Group;
import tn.esprit.planification.enums.StudentLevel;
import tn.esprit.planification.exception.ResourceNotFoundException;
import tn.esprit.planification.repository.GroupRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GroupService Unit Tests")
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private GroupService groupService;

    private Group testGroup;
    private GroupDTO testGroupDTO;

    @BeforeEach
    void setUp() {
        // Setup test group
        testGroup = new Group();
        testGroup.setId(1L);
        testGroup.setLevel(StudentLevel.INTERMEDIATE);
        testGroup.setTeacherId(10L);
        testGroup.setStudentIds(new ArrayList<>(Arrays.asList(1L, 2L, 3L)));

        // Setup test DTO
        testGroupDTO = new GroupDTO();
        testGroupDTO.setLevel(StudentLevel.INTERMEDIATE);
        testGroupDTO.setTeacherId(10L);
        testGroupDTO.setStudentIds(Arrays.asList(1L, 2L, 3L));
    }

    // ==================== GET ALL GROUPS ====================

    @Test
    @DisplayName("Should return all groups")
    void testGetAllGroups() {
        // Given
        List<Group> groups = Arrays.asList(testGroup);
        when(groupRepository.findAll()).thenReturn(groups);

        // When
        List<GroupDTO> result = groupService.getAllGroups();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(StudentLevel.INTERMEDIATE, result.get(0).getLevel());
        verify(groupRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no groups exist")
    void testGetAllGroups_EmptyList() {
        // Given
        when(groupRepository.findAll()).thenReturn(new ArrayList<>());

        // When
        List<GroupDTO> result = groupService.getAllGroups();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(groupRepository, times(1)).findAll();
    }

    // ==================== GET GROUP BY ID ====================

    @Test
    @DisplayName("Should return group by ID")
    void testGetGroupById_Success() {
        // Given
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));

        // When
        GroupDTO result = groupService.getGroupById(1L);

        // Then
        assertNotNull(result);
        assertEquals(StudentLevel.INTERMEDIATE, result.getLevel());
        assertEquals(10L, result.getTeacherId());
        assertEquals(3, result.getStudentIds().size());
        verify(groupRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when group not found")
    void testGetGroupById_NotFound() {
        // Given
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.getGroupById(999L);
        });
        verify(groupRepository, times(1)).findById(999L);
    }

    // ==================== CREATE GROUP ====================

    @Test
    @DisplayName("Should create group successfully")
    void testCreateGroup_Success() {
        // Given
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // When
        GroupDTO result = groupService.createGroup(testGroupDTO);

        // Then
        assertNotNull(result);
        assertEquals(StudentLevel.INTERMEDIATE, result.getLevel());
        verify(groupRepository, times(1)).save(any(Group.class));
    }

    @Test
    @DisplayName("Should create group without teacher")
    void testCreateGroup_NoTeacher() {
        // Given
        testGroupDTO.setTeacherId(null);
        testGroup.setTeacherId(null);
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // When
        GroupDTO result = groupService.createGroup(testGroupDTO);

        // Then
        assertNotNull(result);
        assertNull(result.getTeacherId());
        verify(groupRepository, times(1)).save(any(Group.class));
    }

    @Test
    @DisplayName("Should create group without students")
    void testCreateGroup_NoStudents() {
        // Given
        testGroupDTO.setStudentIds(null);
        testGroup.setStudentIds(new ArrayList<>());
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // When
        GroupDTO result = groupService.createGroup(testGroupDTO);

        // Then
        assertNotNull(result);
        assertTrue(result.getStudentIds().isEmpty());
        verify(groupRepository, times(1)).save(any(Group.class));
    }

    // ==================== ASSIGN TEACHER ====================

    @Test
    @DisplayName("Should assign teacher to group successfully")
    void testAssignTeacherToGroup_Success() {
        // Given
        when(groupRepository.existsById(1L)).thenReturn(true);
        doNothing().when(groupRepository).updateTeacherId(1L, 20L);
        
        testGroup.setTeacherId(20L);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));

        // When
        GroupDTO result = groupService.assignTeacherToGroup(1L, 20L);

        // Then
        assertNotNull(result);
        assertEquals(20L, result.getTeacherId());
        verify(groupRepository, times(1)).existsById(1L);
        verify(groupRepository, times(1)).updateTeacherId(1L, 20L);
        verify(groupRepository, times(1)).findById(1L);
    }

    // ==================== ADD STUDENT ====================

    @Test
    @DisplayName("Should add student to group successfully")
    void testAddStudentToGroup_Success() {
        // Given
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // When
        GroupDTO result = groupService.addStudentToGroup(1L, 4L);

        // Then
        assertNotNull(result);
        assertTrue(testGroup.getStudentIds().contains(4L));
        verify(groupRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    @DisplayName("Should not add duplicate student to group")
    void testAddStudentToGroup_DuplicateStudent() {
        // Given
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        int initialSize = testGroup.getStudentIds().size();

        // When
        GroupDTO result = groupService.addStudentToGroup(1L, 1L); // Student 1 already exists

        // Then
        assertNotNull(result);
        assertEquals(initialSize, testGroup.getStudentIds().size()); // Size unchanged
        verify(groupRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    @DisplayName("Should throw exception when adding student to non-existent group")
    void testAddStudentToGroup_GroupNotFound() {
        // Given
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.addStudentToGroup(999L, 4L);
        });
        verify(groupRepository, times(1)).findById(999L);
        verify(groupRepository, never()).save(any());
    }

    // ==================== ASSIGN MULTIPLE STUDENTS ====================

    @Test
    @DisplayName("Should assign multiple students to group successfully")
    void testAssignStudentsToGroup_Success() {
        // Given
        List<Long> newStudents = Arrays.asList(4L, 5L, 6L);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // When
        GroupDTO result = groupService.assignStudentsToGroup(1L, newStudents);

        // Then
        assertNotNull(result);
        assertTrue(testGroup.getStudentIds().contains(4L));
        assertTrue(testGroup.getStudentIds().contains(5L));
        assertTrue(testGroup.getStudentIds().contains(6L));
        verify(groupRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    @DisplayName("Should not add duplicate students when assigning multiple")
    void testAssignStudentsToGroup_WithDuplicates() {
        // Given
        List<Long> studentsWithDuplicates = Arrays.asList(1L, 4L, 5L); // 1L already exists
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        int initialSize = testGroup.getStudentIds().size();

        // When
        GroupDTO result = groupService.assignStudentsToGroup(1L, studentsWithDuplicates);

        // Then
        assertNotNull(result);
        assertEquals(initialSize + 2, testGroup.getStudentIds().size()); // Only 2 new students added
        verify(groupRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    @DisplayName("Should throw exception when assigning students to non-existent group")
    void testAssignStudentsToGroup_GroupNotFound() {
        // Given
        List<Long> students = Arrays.asList(4L, 5L);
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.assignStudentsToGroup(999L, students);
        });
        verify(groupRepository, times(1)).findById(999L);
        verify(groupRepository, never()).save(any());
    }

    // ==================== DELETE GROUP ====================

    @Test
    @DisplayName("Should delete group successfully")
    void testDeleteGroup_Success() {
        // Given
        when(groupRepository.existsById(1L)).thenReturn(true);
        doNothing().when(groupRepository).deleteById(1L);

        // When
        groupService.deleteGroup(1L);

        // Then
        verify(groupRepository, times(1)).existsById(1L);
        verify(groupRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent group")
    void testDeleteGroup_NotFound() {
        // Given
        when(groupRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.deleteGroup(999L);
        });
        verify(groupRepository, times(1)).existsById(999L);
        verify(groupRepository, never()).deleteById(anyLong());
    }
}
