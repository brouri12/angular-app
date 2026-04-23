package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

/**
 * Lecture seule pour certificats PDF (table {@code students} existante côté plateforme).
 */
@Entity
@Immutable
@Table(name = "students")
@Getter
@NoArgsConstructor
public class Student {

    @Id
    private Long id;

    @Column(name = "firstName", length = 100)
    private String firstName;

    @Column(name = "lastName", length = 100)
    private String lastName;

    @Column(name = "email", length = 150)
    private String email;
}
