package org.example.repository;

import org.example.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByUserIdOrderBySubmittedAtDesc(String userId);

    List<Submission> findByGameIdOrderBySubmittedAtDesc(Long gameId);

    long countByStatus(String status);
}
