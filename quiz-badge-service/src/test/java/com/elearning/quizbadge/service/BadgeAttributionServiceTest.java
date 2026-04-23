package com.elearning.quizbadge.service;

import com.elearning.quizbadge.entity.Badge;
import com.elearning.quizbadge.entity.CourseEnrollment;
import com.elearning.quizbadge.repository.BadgeRepository;
import com.elearning.quizbadge.repository.CourseEnrollmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BadgeAttributionServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @InjectMocks
    private BadgeAttributionService service;

    private CourseEnrollment completed;

    @BeforeEach
    void setUp() {
        completed = CourseEnrollment.builder()
                .id(1L)
                .studentId(10L)
                .courseId(99L)
                .completionPercentage(BigDecimal.valueOf(100))
                .finalGrade(BigDecimal.valueOf(100))
                .enrollmentDate(LocalDate.now().minusDays(3))
                .build();
    }

    @Test
    void checkAndAwardBadges_awardsCompletion_andPerfect_andSpeed_whenEligibleAndNotAlreadyOwned() {
        when(courseEnrollmentRepository.findByStudentId(10L)).thenReturn(List.of(completed));
        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.COURSE_COMPLETION)).thenReturn(false);
        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.PERFECT_SCORE)).thenReturn(false);
        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.SPEED_STAR)).thenReturn(false);
        when(badgeRepository.save(any(Badge.class))).thenAnswer(inv -> inv.getArgument(0));

        service.checkAndAwardBadges(10L);

        ArgumentCaptor<Badge> captor = ArgumentCaptor.forClass(Badge.class);
        verify(badgeRepository, times(3)).save(captor.capture());
        List<Badge.BadgeType> types = captor.getAllValues().stream().map(Badge::getBadgeType).toList();
        assertThat(types).containsExactlyInAnyOrder(
                Badge.BadgeType.COURSE_COMPLETION,
                Badge.BadgeType.PERFECT_SCORE,
                Badge.BadgeType.SPEED_STAR
        );
    }

    @Test
    void checkAndAwardBadges_awardsStreak_whenThreeCompletedCourses() {
        CourseEnrollment c2 = CourseEnrollment.builder().studentId(10L).courseId(2L).completionPercentage(BigDecimal.valueOf(100)).build();
        CourseEnrollment c3 = CourseEnrollment.builder().studentId(10L).courseId(3L).completionPercentage(BigDecimal.valueOf(100)).build();
        when(courseEnrollmentRepository.findByStudentId(10L)).thenReturn(List.of(completed, c2, c3));

        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.COURSE_COMPLETION)).thenReturn(true);
        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.PERFECT_SCORE)).thenReturn(true);
        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.SPEED_STAR)).thenReturn(true);
        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.STREAK)).thenReturn(false);
        when(badgeRepository.save(any(Badge.class))).thenAnswer(inv -> inv.getArgument(0));

        service.checkAndAwardBadges(10L);

        ArgumentCaptor<Badge> captor = ArgumentCaptor.forClass(Badge.class);
        verify(badgeRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getBadgeType()).isEqualTo(Badge.BadgeType.STREAK);
        assertThat(captor.getValue().getStudentId()).isEqualTo(10L);
    }

    @Test
    void checkAndAwardTopStudentBadge_awardsWhenAverageAtLeast90() {
        CourseEnrollment e1 = CourseEnrollment.builder().studentId(10L).courseId(1L).finalGrade(BigDecimal.valueOf(95)).build();
        CourseEnrollment e2 = CourseEnrollment.builder().studentId(10L).courseId(2L).finalGrade(BigDecimal.valueOf(90)).build();
        when(courseEnrollmentRepository.findByStudentId(10L)).thenReturn(List.of(e1, e2));
        when(badgeRepository.existsByStudentIdAndBadgeType(10L, Badge.BadgeType.TOP_STUDENT)).thenReturn(false);
        when(badgeRepository.save(any(Badge.class))).thenAnswer(inv -> inv.getArgument(0));

        service.checkAndAwardTopStudentBadge(10L);

        ArgumentCaptor<Badge> captor = ArgumentCaptor.forClass(Badge.class);
        verify(badgeRepository).save(captor.capture());
        assertThat(captor.getValue().getBadgeType()).isEqualTo(Badge.BadgeType.TOP_STUDENT);
        assertThat(captor.getValue().getBadgeLevel()).isEqualTo(Badge.BadgeLevel.DIAMOND);
    }
}

