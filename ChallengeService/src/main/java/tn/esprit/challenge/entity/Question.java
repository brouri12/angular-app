package tn.esprit.challenge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.challenge.enums.QuestionType;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;
    
    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options = new ArrayList<>(); // For multiple choice
    
    @Column(columnDefinition = "TEXT")
    private String correctAnswer;
    
    @ElementCollection
    @CollectionTable(name = "question_acceptable_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "answer_text")
    private List<String> acceptableAnswers = new ArrayList<>(); // Alternative correct answers
    
    @Column(columnDefinition = "TEXT")
    private String explanation; // Explanation shown after answering
    
    @Column(nullable = false)
    private Integer points = 10;
    
    @Column(nullable = false)
    private Integer orderIndex = 0; // Order in the challenge
    
    private String imageUrl; // Optional image for the question
}
