package com.esprit.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "answer")
@EntityListeners(AnswerListener.class)  // Automatic scoring on save
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ans")
    private Long idAnswer;
    
    @Column(columnDefinition = "TEXT")
    private String answer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_eval")
    @JsonIgnore
    private Evaluation eval;
    
    @ManyToOne
    @JoinColumn(name = "id_qu")
    private Question question;
    
    @OneToOne(mappedBy = "answer", cascade = CascadeType.ALL)
    private Note note;

    public Answer() {}
}
