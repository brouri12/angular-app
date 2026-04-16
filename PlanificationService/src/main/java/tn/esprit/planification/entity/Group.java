package tn.esprit.planification.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.NoArgsConstructor;
import tn.esprit.planification.enums.StudentLevel;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_groups")
@NoArgsConstructor
public class Group {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Group level is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudentLevel level;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "group_students", joinColumns = @JoinColumn(name = "group_id"))
    @Column(name = "student_id")
    private List<Long> studentIds = new ArrayList<>();
    
    // Store teacher ID without foreign key constraint
    @Column(name = "teacher_id")
    private Long teacherId;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public StudentLevel getLevel() {
        return level;
    }
    
    public void setLevel(StudentLevel level) {
        this.level = level;
    }
    
    public List<Long> getStudentIds() {
        if (studentIds == null) {
            studentIds = new ArrayList<>();
        }
        return studentIds;
    }
    
    public void setStudentIds(List<Long> studentIds) {
        this.studentIds = studentIds;
    }
    
    public Long getTeacherId() {
        return teacherId;
    }
    
    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }
}
