package com.esprit.demo.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "evaluation")

public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEval;
    private String title;
    private String level;
    private Long duration;
    private String description;
    private String question;
    private String filePath;

    // Listening section
    private String listeningUrl;         // audio URL (mp3 / YouTube embed)
    @Column(columnDefinition = "TEXT")
    private String listeningQuestions;   // JSON array of comprehension questions

    // Essay section
    @Column(columnDefinition = "TEXT")
    private String essayPrompt;          // writing prompt shown to student
    private Integer essayMinWords;
    private Integer essayMaxWords;

    // Status and deadline for automatic closing
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationStatus status = EvaluationStatus.OPEN;
    
    @Column(nullable = true)
    private java.time.LocalDateTime deadline;

    // Section-based weight system (total = 20 points)
    @Column(nullable = true)
    private Double grammarWeight = 10.0;  // Default: /10
    
    @Column(nullable = true)
    private Double listeningWeight = 5.0;  // Default: /5
    
    @Column(nullable = true)
    private Double essayWeight = 5.0;  // Default: /5
    
    // Correct answers for automatic scoring (JSON format)
    @Column(columnDefinition = "TEXT", nullable = true)
    private String correctAnswers;  
    // Format: {"questions":["correct1","correct2"],"listening":["correct1","correct2"]}

    public Evaluation() {}

  //  @OneToMany(mappedBy = "evaluation")
   // private List<Note> notes;

    @OneToMany(mappedBy = "eval")
    @JsonIgnore
    private List<Answer> answers;

}
