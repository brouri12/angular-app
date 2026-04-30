package com.elearning.quizbadge.service;

import com.elearning.quizbadge.client.FormationCourseClient;
import com.elearning.quizbadge.dto.RemoteCourseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Accès résilient au catalogue formation (Feign).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FormationCourseLookupService {

    private final FormationCourseClient formationCourseClient;

    public Optional<RemoteCourseDTO> findCourse(Long courseId) {
        if (courseId == null) {
            return Optional.empty();
        }
        try {
            return Optional.ofNullable(formationCourseClient.getCourseById(courseId));
        } catch (Exception ex) {
            log.warn("formation-service indisponible pour courseId={}: {}", courseId, ex.getMessage());
            return Optional.empty();
        }
    }
}
