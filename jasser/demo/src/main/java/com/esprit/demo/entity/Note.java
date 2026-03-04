package com.esprit.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "note")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idNote;
    
    // Score value (based on section weight)
    @Column(nullable = false)
    private Double value;
    
    // Section this note belongs to
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionSection section;

    @ManyToOne
    @JoinColumn(name = "id_eval")
    @JsonIgnore
    private Evaluation evaluation;

    @OneToOne
    @JoinColumn(name = "id_ans")
    @JsonIgnore
    private Answer answer;

    public Note() {}
}
