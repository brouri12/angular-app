package com.elearning.quizbadge.controller;

import com.elearning.quizbadge.dto.ChatbotRequest;
import com.elearning.quizbadge.dto.ChatbotResponse;
import com.elearning.quizbadge.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Chatbot étudiant sur le même service que quiz/badges (port 8082).
 * Compatibilité front : {@code /api/chatbot/student} et {@code /api/auth/chatbot/student}.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping({"/api/chatbot/student", "/api/auth/chatbot/student"})
    public ResponseEntity<ChatbotResponse> chatbotStudent(@RequestBody(required = false) ChatbotRequest request) {
        log.debug("POST chatbot/student");
        try {
            ChatbotRequest req = (request != null && request.getMessage() != null) ? request : new ChatbotRequest();
            return ResponseEntity.ok(chatbotService.process(req));
        } catch (Exception e) {
            String msg = (e.getMessage() != null && !e.getMessage().isBlank()) ? e.getMessage() : "Coach unavailable";
            return ResponseEntity.ok(ChatbotResponse.error(msg));
        }
    }
}
