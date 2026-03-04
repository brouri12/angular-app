package com.esprit.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idQu;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    // Section this question belongs to
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionSection section = QuestionSection.GRAMMAR;
    
    // Correct answer (for GRAMMAR and LISTENING sections only)
    @Column(columnDefinition = "TEXT")
    private String correctAnswer;
    
    // Link to evaluation
    @ManyToOne
    @JoinColumn(name = "id_eval")
    private Evaluation evaluation;
}
