package com.gestions.ramzi.servicepronunciation.entities;

import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import com.gestions.ramzi.servicepronunciation.enums.PhonemeCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * Entité représentant un phonème de l'anglais
 */
@Entity
@Table(name = "phoneme_library")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Phoneme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String symbol;  // θ, ð, ŋ, etc.

    @Column(nullable = false)
    private String name;  // "Theta", "Eth", "Eng"

    @Column(length = 1000)
    private String description;  // Description pour les étudiants

    @Column(length = 500)
    private String audioExampleUrl;  // Exemple audio

    @Column(length = 1000)
    private String tipsForStudents;  // Conseils pour la prononcer

    @Enumerated(EnumType.STRING)
    private PhonemeCategory category;  // CONSONANT, VOWEL, DIPHTHONG

    @Enumerated(EnumType.STRING)
    private NiveauCECRL typicalLevel;

    // Exemples de mots
    @ElementCollection
    @CollectionTable(name = "phoneme_examples", joinColumns = @JoinColumn(name = "phoneme_id"))
    @Column(name = "example_word")
    private List<String> exampleWords;
}
