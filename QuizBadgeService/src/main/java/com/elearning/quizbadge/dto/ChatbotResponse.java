package com.elearning.quizbadge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {

    private boolean ok;
    private String reply;
    private Boolean englishOnly;

    public static ChatbotResponse success(String reply) {
        return new ChatbotResponse(true, reply, null);
    }

    public static ChatbotResponse englishOnly(String reply) {
        return new ChatbotResponse(true, reply, true);
    }

    public static ChatbotResponse error(String message) {
        String reply = (message != null && !message.isBlank()) ? message : "Coach unavailable";
        return new ChatbotResponse(false, reply, null);
    }
}
