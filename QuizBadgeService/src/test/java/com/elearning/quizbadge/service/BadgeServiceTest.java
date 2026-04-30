package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.BadgeDTO;
import com.elearning.quizbadge.entity.Badge;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.BadgeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private BadgeAttributionService badgeAttributionService;

    @InjectMocks
    private BadgeService badgeService;

    private BadgeDTO awardDto;
    private Badge savedBadge;

    @BeforeEach
    void setUp() {
        awardDto = BadgeDTO.builder()
                .studentId(1L)
                .badgeName("Quiz Master")
                .badgeType(Badge.BadgeType.QUIZ_MASTER)
                .description("desc")
                .badgeLevel(Badge.BadgeLevel.GOLD)
                .earnedDate(LocalDate.now())
                .build();

        savedBadge = Badge.builder()
                .id(100L)
                .studentId(1L)
                .badgeName("Quiz Master")
                .badgeType(Badge.BadgeType.QUIZ_MASTER)
                .description("desc")
                .badgeLevel(Badge.BadgeLevel.GOLD)
                .earnedDate(LocalDate.now())
                .build();
    }

    @Test
    void awardBadge_savesWhenStudentDoesNotHaveType() {
        when(badgeRepository.existsByStudentIdAndBadgeType(1L, Badge.BadgeType.QUIZ_MASTER)).thenReturn(false);
        when(badgeRepository.save(any(Badge.class))).thenAnswer(invocation -> {
            Badge b = invocation.getArgument(0);
            b.setId(100L);
            return b;
        });

        BadgeDTO result = badgeService.awardBadge(awardDto);

        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getBadgeName()).isEqualTo("Quiz Master");
        verify(badgeRepository).save(any(Badge.class));
    }

    @Test
    void awardBadge_throwsWhenDuplicateBadgeType() {
        when(badgeRepository.existsByStudentIdAndBadgeType(1L, Badge.BadgeType.QUIZ_MASTER)).thenReturn(true);

        assertThatThrownBy(() -> badgeService.awardBadge(awardDto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("already has this badge");
    }

    @Test
    void getBadgeById_returnsDtoWhenFound() {
        when(badgeRepository.findById(100L)).thenReturn(Optional.of(savedBadge));

        BadgeDTO result = badgeService.getBadgeById(100L);

        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getStudentId()).isEqualTo(1L);
    }

    @Test
    void getBadgeById_throwsWhenMissing() {
        when(badgeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> badgeService.getBadgeById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void getBadgesByStudent_mapsList() {
        when(badgeRepository.findByStudentId(1L)).thenReturn(List.of(savedBadge));

        List<BadgeDTO> list = badgeService.getBadgesByStudent(1L);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getBadgeType()).isEqualTo(Badge.BadgeType.QUIZ_MASTER);
    }

    @Test
    void getBadgeCount_delegatesToRepository() {
        when(badgeRepository.countByStudentId(1L)).thenReturn(3L);

        assertThat(badgeService.getBadgeCount(1L)).isEqualTo(3L);
    }

    @Test
    void checkAndAwardBadges_delegatesToAttributionService() {
        badgeService.checkAndAwardBadges(42L);
        verify(badgeAttributionService).checkAndAwardBadges(42L);
    }

    @Test
    void deleteBadge_throwsWhenMissing() {
        when(badgeRepository.existsById(5L)).thenReturn(false);

        assertThatThrownBy(() -> badgeService.deleteBadge(5L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(badgeRepository, never()).deleteById(5L);
    }

    @Test
    void deleteBadge_deletesWhenPresent() {
        when(badgeRepository.existsById(5L)).thenReturn(true);

        badgeService.deleteBadge(5L);

        verify(badgeRepository).deleteById(5L);
    }
}
