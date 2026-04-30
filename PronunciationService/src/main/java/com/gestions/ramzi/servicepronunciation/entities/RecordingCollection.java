package com.gestions.ramzi.servicepronunciation.entities;

import com.gestions.ramzi.servicepronunciation.enums.CollectionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recording_collections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordingCollection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CollectionType type;

    @Column(nullable = false)
    private int count;

    private int streakCurrent;
    private int streakMax;

    private LocalDateTime lastAdded;

    @PrePersist
    @PreUpdate
    private void updateLastAdded() {
        lastAdded = LocalDateTime.now();
    }
}

