package com.elearning.quizbadge.web;

import com.elearning.quizbadge.dto.QuizSessionStartRequest;
import com.elearning.quizbadge.dto.QuizSessionSubmitRequest;
import com.elearning.quizbadge.entity.Quiz;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.QuizQuestionRepository;
import com.elearning.quizbadge.repository.QuizRepository;
import com.elearning.quizbadge.service.QuizAdvancedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Passage de quiz en MVC Thymeleaf (formulaires HTML, pas de JSON).
 * Exemple : {@code /ui/quiz/1?studentId=42}
 */
@Controller
@RequestMapping("/ui")
@RequiredArgsConstructor
public class QuizWebController {

    private final QuizAdvancedService quizAdvancedService;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;

    @GetMapping("/quiz/{quizId}")
    public String playPage(
            @PathVariable Long quizId,
            @RequestParam Long studentId,
            Model model
    ) {
        var eligibility = quizAdvancedService.checkEligibility(quizId, studentId);
        if (!eligibility.isAllowed()) {
            model.addAttribute("message", eligibility.getMessage());
            model.addAttribute("quizId", quizId);
            model.addAttribute("studentId", studentId);
            return "quiz/ui-blocked";
        }

        var start = quizAdvancedService.startOrResume(
                QuizSessionStartRequest.builder().quizId(quizId).studentId(studentId).build()
        );
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));

        List<QuizQuestionRow> questions = quizQuestionRepository
                .findByQuizIdOrderByOrderNumberAscIdAsc(quizId)
                .stream()
                .filter(q -> Boolean.TRUE.equals(q.getIsActive()))
                .map(QuizQuestionRow::from)
                .toList();

        if (questions.isEmpty()) {
            model.addAttribute("message", "Aucune question active pour ce quiz.");
            return "quiz/ui-error";
        }

        QuizPlayPage page = QuizPlayPage.builder()
                .quizTitle(quiz.getTitle())
                .quizId(quizId)
                .studentId(studentId)
                .sessionId(start.getId())
                .timeLimitSeconds(start.getTimeLimitSeconds())
                .remainingSeconds(start.getRemainingSeconds())
                .tabHiddenCount(start.getTabHiddenCount())
                .clipboardBlockCount(start.getClipboardBlockCount())
                .questions(questions)
                .build();

        model.addAttribute("page", page);
        return "quiz/ui-play";
    }

    @PostMapping("/quiz-sessions/{sessionId}/submit")
    public String submit(
            @PathVariable Long sessionId,
            @Valid @ModelAttribute QuizSessionSubmitRequest submitRequest,
            Model model
    ) {
        var result = quizAdvancedService.submit(sessionId, submitRequest);
        model.addAttribute("result", result);
        model.addAttribute("quizTitle", quizRepository.findById(submitRequest.getQuizId())
                .map(Quiz::getTitle)
                .orElse("Quiz"));
        return "quiz/ui-result";
    }
}
