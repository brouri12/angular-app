package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.BadgeDTO;
import com.elearning.quizbadge.dto.EnrichedBadgeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeEnrichmentService {

    private final BadgeService badgeService;
    private final FormationCourseLookupService formationCourseLookupService;

    @Transactional(readOnly = true)
    public List<EnrichedBadgeDTO> getBadgesByStudentEnriched(Long studentId) {
        return badgeService.getBadgesByStudent(studentId).stream()
                .map(this::enrich)
                .collect(Collectors.toList());
    }

    private EnrichedBadgeDTO enrich(BadgeDTO badge) {
        if (badge.getCourseId() == null) {
            return EnrichedBadgeDTO.builder()
                    .badge(badge)
                    .courseTitle(null)
                    .courseCode(null)
                    .build();
        }
        return formationCourseLookupService.findCourse(badge.getCourseId())
                .map(course -> EnrichedBadgeDTO.builder()
                        .badge(badge)
                        .courseTitle(course.getTitle())
                        .courseCode(course.getCourseCode())
                        .build())
                .orElseGet(() -> EnrichedBadgeDTO.builder()
                        .badge(badge)
                        .courseTitle(null)
                        .courseCode(null)
                        .build());
    }
}
