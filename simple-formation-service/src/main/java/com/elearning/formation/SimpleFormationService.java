package com.elearning.formation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicLong;

@SpringBootApplication
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SimpleFormationService {

    // Simple in-memory storage
    private static List<Course> courses = new ArrayList<>();
    private static AtomicLong nextId = new AtomicLong(1);

    public static void main(String[] args) {
        SpringApplication.run(SimpleFormationService.class, args);
    }

    @GetMapping("/courses/test")
    public ResponseEntity<ResponseMessage> test() {
        return ResponseEntity.ok(new ResponseMessage("OK", "Formation Service", "8081", LocalDateTime.now().toString()));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        course.setId(nextId.getAndIncrement());
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        courses.add(course);
        return ResponseEntity.status(201).body(course);
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courses.stream()
                .filter(course -> course.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Simple DTO classes
    public static class Course {
        private Long id;
        private String courseCode;
        private String title;
        private String description;
        private Long teacherId;
        private Integer durationHours;
        private Double price;
        private Integer maxStudents;
        private String level;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getTeacherId() { return teacherId; }
        public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
        public Integer getDurationHours() { return durationHours; }
        public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public Integer getMaxStudents() { return maxStudents; }
        public void setMaxStudents(Integer maxStudents) { this.maxStudents = maxStudents; }
        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ResponseMessage {
        private String status;
        private String service;
        private String port;
        private String timestamp;

        public ResponseMessage(String status, String service, String port, String timestamp) {
            this.status = status;
            this.service = service;
            this.port = port;
            this.timestamp = timestamp;
        }

        // Getters
        public String getStatus() { return status; }
        public String getService() { return service; }
        public String getPort() { return port; }
        public String getTimestamp() { return timestamp; }
    }
}
