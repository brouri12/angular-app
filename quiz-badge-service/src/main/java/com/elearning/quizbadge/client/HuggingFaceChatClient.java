package com.elearning.quizbadge.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Client OpenFeign vers Hugging Face router (API compatible OpenAI chat/completions).
 *
 * Base URL configurable via {@code chatbot.huggingface.base-url}.
 */
@FeignClient(name = "huggingface-chat", url = "${chatbot.huggingface.base-url:https://router.huggingface.co}")
public interface HuggingFaceChatClient {

    @PostMapping(value = "/v1/chat/completions", consumes = MediaType.APPLICATION_JSON_VALUE)
    String chatCompletions(
            @RequestHeader("Authorization") String authorization,
            @RequestBody String jsonBody
    );
}

