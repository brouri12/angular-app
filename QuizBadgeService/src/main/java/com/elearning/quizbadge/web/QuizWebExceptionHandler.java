package com.elearning.quizbadge.web;

import com.elearning.quizbadge.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

/**
 * Erreurs métier pour les écrans Thymeleaf (évite une réponse JSON générique).
 */
@ControllerAdvice(assignableTypes = QuizWebController.class)
public class QuizWebExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ModelAndView notFound(ResourceNotFoundException ex) {
        ModelAndView mv = new ModelAndView("quiz/ui-error");
        mv.addObject("message", ex.getMessage());
        return mv;
    }

    @ExceptionHandler(IllegalStateException.class)
    public ModelAndView illegalState(IllegalStateException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Action impossible.";
        ModelAndView mv = new ModelAndView("quiz/ui-error");
        mv.addObject("message", msg);
        return mv;
    }
}
