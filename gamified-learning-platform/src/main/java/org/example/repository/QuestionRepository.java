package org.example.repository;

import org.example.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByGameIdOrderByOrderIndexAsc(Long gameId);

    long countByGameId(Long gameId);

    void deleteByGameId(Long gameId);
}
