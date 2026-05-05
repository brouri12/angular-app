package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Generates word ladder puzzles locally — no external API needed.
 * Each ladder is a pre-built sequence of real English words.
 */
@RestController
@RequestMapping("/api/wordladder")
@Slf4j
public class WordLadderProxyController {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // Pre-built ladders: each entry is a complete valid ladder
    private static final List<String[]> EASY_LADDERS = List.of(
        new String[]{"CAT", "COT", "DOT", "DOG"},
        new String[]{"HOT", "HOP", "TOP", "TIP"},
        new String[]{"BAT", "BAD", "BID", "BIG"},
        new String[]{"MAN", "PAN", "PIN", "PIG"},
        new String[]{"CAR", "BAR", "BAT", "HAT"}
    );

    private static final List<String[]> MEDIUM_LADDERS = List.of(
        new String[]{"COLD", "CORD", "CORE", "CARE", "DARE", "DARK"},
        new String[]{"LOVE", "LIVE", "LIKE", "BIKE", "BITE", "KITE"},
        new String[]{"HEAD", "BEAD", "BEAT", "HEAT", "HEAP", "REAP", "REAL", "TEAL", "TAIL"},
        new String[]{"LEAD", "LOAD", "ROAD", "TOAD", "TOLD", "GOLD"},
        new String[]{"WORD", "WARD", "WARM", "WORM", "FORM", "FORK"}
    );

    private static final List<String[]> HARD_LADDERS = List.of(
        new String[]{"STONE", "STORE", "SCORE", "SCARE", "SHARE", "SHAME", "SHALE", "WHALE", "WHILE", "WHITE"},
        new String[]{"BLACK", "SLACK", "SLICK", "CLICK", "CLOCK", "FLOCK", "FLOOR", "FLOOD", "BLOOD", "BROOD"},
        new String[]{"BREAD", "BREAK", "CREAK", "CREAM", "DREAM", "DREAD", "TREAD", "TREAT", "GREAT", "GREET"},
        new String[]{"SMART", "START", "STARK", "STARE", "SHARE", "SHAME", "SHALE", "SHAKE", "SNAKE", "SNARE"},
        new String[]{"FLOUR", "FLOOR", "FLOOD", "BLOOD", "BROOD", "BROAD", "BREAD", "BREAK", "CREAK", "CREAM"}
    );

    @GetMapping("/generate")
    public ResponseEntity<String> generate(
            @RequestParam(defaultValue = "medium") String difficulty) {

        log.info("Generating local word ladder: difficulty={}", difficulty);

        try {
            List<String[]> pool = switch (difficulty.toLowerCase()) {
                case "easy" -> EASY_LADDERS;
                case "hard" -> HARD_LADDERS;
                default     -> MEDIUM_LADDERS;
            };

            String[] ladder = pool.get((int)(Math.random() * pool.size()));

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("startWord", ladder[0]);
            data.put("endWord", ladder[ladder.length - 1]);
            data.put("ladder", ladder);
            data.put("steps", ladder.length - 1);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("data", data);

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MAPPER.writeValueAsString(response));

        } catch (Exception e) {
            log.error("Word ladder generation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"status\":\"error\",\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
