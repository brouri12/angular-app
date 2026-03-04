package com.esprit.demo.repository;

import com.esprit.demo.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnswerRepo extends JpaRepository<Answer, Long> {
}
