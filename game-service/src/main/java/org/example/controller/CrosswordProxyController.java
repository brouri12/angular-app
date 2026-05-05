package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Generates crossword puzzles locally — no external API needed.
 * Produces a grid + across/down clues from a built-in word bank.
 */
@RestController
@RequestMapping("/api/crossword")
@Slf4j
public class CrosswordProxyController {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // ── Word bank: word → clue ────────────────────────────────────────────────
    private static final Map<String, String> WORD_BANK = new LinkedHashMap<>();
    static {
        WORD_BANK.put("APPLE",   "A red or green fruit");
        WORD_BANK.put("BREAD",   "Baked food made from flour");
        WORD_BANK.put("CLOUD",   "White fluffy thing in the sky");
        WORD_BANK.put("DANCE",   "Move rhythmically to music");
        WORD_BANK.put("EARTH",   "Our home planet");
        WORD_BANK.put("FLAME",   "Burning fire");
        WORD_BANK.put("GRAPE",   "Small fruit used to make wine");
        WORD_BANK.put("HEART",   "Organ that pumps blood");
        WORD_BANK.put("IMAGE",   "A picture or photo");
        WORD_BANK.put("JUICE",   "Liquid from fruit");
        WORD_BANK.put("KNIFE",   "Sharp cutting tool");
        WORD_BANK.put("LEMON",   "Yellow sour citrus fruit");
        WORD_BANK.put("MUSIC",   "Art of combining sounds");
        WORD_BANK.put("NIGHT",   "Time when it is dark");
        WORD_BANK.put("OCEAN",   "Large body of salt water");
        WORD_BANK.put("PIANO",   "Musical instrument with keys");
        WORD_BANK.put("QUEEN",   "Female ruler of a kingdom");
        WORD_BANK.put("RIVER",   "Flowing body of fresh water");
        WORD_BANK.put("SMILE",   "Happy facial expression");
        WORD_BANK.put("TIGER",   "Large striped wild cat");
        WORD_BANK.put("UNCLE",   "Parent's brother");
        WORD_BANK.put("VOICE",   "Sound produced when speaking");
        WORD_BANK.put("WATER",   "Clear liquid essential for life");
        WORD_BANK.put("XENON",   "Noble gas used in lamps");
        WORD_BANK.put("YACHT",   "Luxury sailing boat");
        WORD_BANK.put("ZEBRA",   "Black and white striped animal");
        WORD_BANK.put("STORM",   "Violent weather with rain");
        WORD_BANK.put("PLANT",   "Living organism that grows in soil");
        WORD_BANK.put("LIGHT",   "Electromagnetic radiation we can see");
        WORD_BANK.put("STONE",   "Hard mineral matter");
        WORD_BANK.put("TRAIN",   "Vehicle that runs on rails");
        WORD_BANK.put("CHAIR",   "Piece of furniture to sit on");
        WORD_BANK.put("CLOCK",   "Device that shows the time");
        WORD_BANK.put("DREAM",   "Images seen while sleeping");
        WORD_BANK.put("EAGLE",   "Large bird of prey");
        WORD_BANK.put("FROST",   "Ice crystals formed on surfaces");
        WORD_BANK.put("GLOBE",   "Spherical model of the Earth");
        WORD_BANK.put("HORSE",   "Large animal used for riding");
        WORD_BANK.put("INBOX",   "Where emails arrive");
        WORD_BANK.put("JOKER",   "Playing card or comedian");
    }

    @GetMapping("/generate")
    public ResponseEntity<String> generate(
            @RequestParam(defaultValue = "medium") String size,
            @RequestParam(defaultValue = "animals") String theme,
            @RequestParam(defaultValue = "medium") String difficulty) {

        log.info("Generating local crossword: theme={} difficulty={}", theme, difficulty);

        try {
            int gridSize = difficulty.equals("easy") ? 10 : difficulty.equals("hard") ? 15 : 12;
            List<String> words = pickWords(difficulty);
            Map<String, Object> result = buildCrossword(words, gridSize);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("size", gridSize);
            data.put("difficulty", difficulty);
            data.put("theme", theme);
            data.put("grid", result.get("grid"));
            data.put("across", result.get("across"));
            data.put("down", result.get("down"));
            data.put("wordCount", result.get("wordCount"));

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "ok");
            response.put("data", data);

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MAPPER.writeValueAsString(response));

        } catch (Exception e) {
            log.error("Crossword generation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"status\":\"error\",\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ── Pick words based on difficulty ────────────────────────────────────────
    private List<String> pickWords(String difficulty) {
        List<String> all = new ArrayList<>(WORD_BANK.keySet());
        Collections.shuffle(all);
        int count = difficulty.equals("easy") ? 6 : difficulty.equals("hard") ? 12 : 9;
        return all.subList(0, Math.min(count, all.size()));
    }

    // ── Simple crossword builder ───────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private Map<String, Object> buildCrossword(List<String> words, int gridSize) {
        String[][] grid = new String[gridSize][gridSize];
        List<Map<String, Object>> across = new ArrayList<>();
        List<Map<String, Object>> down = new ArrayList<>();
        List<PlacedWord> placed = new ArrayList<>();

        // Sort words longest first for better placement
        words.sort((a, b) -> b.length() - a.length());

        for (String word : words) {
            if (placed.isEmpty()) {
                // Place first word horizontally in the middle
                int row = gridSize / 2;
                int col = (gridSize - word.length()) / 2;
                placeWord(grid, word, row, col, true);
                placed.add(new PlacedWord(word, row, col, true));
            } else {
                // Try to intersect with existing words
                boolean success = false;
                outer:
                for (PlacedWord pw : placed) {
                    for (int i = 0; i < word.length(); i++) {
                        for (int j = 0; j < pw.word.length(); j++) {
                            if (word.charAt(i) == pw.word.charAt(j)) {
                                // Try placing perpendicular
                                boolean newAcross = !pw.across;
                                int row, col;
                                if (newAcross) {
                                    row = pw.across ? pw.row : pw.row + j;
                                    col = pw.across ? pw.col + j - i : pw.col - i;
                                } else {
                                    row = pw.across ? pw.row - i : pw.row + j - i;
                                    col = pw.across ? pw.col + j : pw.col;
                                }
                                if (canPlace(grid, word, row, col, newAcross, gridSize)) {
                                    placeWord(grid, word, row, col, newAcross);
                                    placed.add(new PlacedWord(word, row, col, newAcross));
                                    success = true;
                                    break outer;
                                }
                            }
                        }
                    }
                }
                if (!success) {
                    // Place in empty area
                    for (int r = 1; r < gridSize - 1; r++) {
                        int c = 1;
                        if (canPlace(grid, word, r, c, true, gridSize)) {
                            placeWord(grid, word, r, c, true);
                            placed.add(new PlacedWord(word, r, c, true));
                            break;
                        }
                    }
                }
            }
        }

        // Build clue lists
        for (PlacedWord pw : placed) {
            String clue = WORD_BANK.getOrDefault(pw.word, "A word");
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("number", placed.indexOf(pw) + 1);
            entry.put("clue", clue);
            entry.put("answer", pw.word);
            entry.put("length", pw.word.length());
            if (pw.across) across.add(entry);
            else down.add(entry);
        }

        // Convert grid to nullable array (null = black cell)
        Object[][] outGrid = new Object[gridSize][gridSize];
        for (int r = 0; r < gridSize; r++)
            for (int c = 0; c < gridSize; c++)
                outGrid[r][c] = grid[r][c]; // null if empty

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("grid", outGrid);
        result.put("across", across);
        result.put("down", down);
        result.put("wordCount", placed.size());
        return result;
    }

    private boolean canPlace(String[][] grid, String word, int row, int col, boolean across, int size) {
        if (row < 0 || col < 0) return false;
        int endRow = across ? row : row + word.length() - 1;
        int endCol = across ? col + word.length() - 1 : col;
        if (endRow >= size || endCol >= size) return false;

        for (int i = 0; i < word.length(); i++) {
            int r = across ? row : row + i;
            int c = across ? col + i : col;
            String existing = grid[r][c];
            if (existing != null && !existing.equals(String.valueOf(word.charAt(i)))) return false;
        }
        return true;
    }

    private void placeWord(String[][] grid, String word, int row, int col, boolean across) {
        for (int i = 0; i < word.length(); i++) {
            int r = across ? row : row + i;
            int c = across ? col + i : col;
            grid[r][c] = String.valueOf(word.charAt(i));
        }
    }

    private static class PlacedWord {
        String word; int row, col; boolean across;
        PlacedWord(String w, int r, int c, boolean a) { word=w; row=r; col=c; across=a; }
    }
}
