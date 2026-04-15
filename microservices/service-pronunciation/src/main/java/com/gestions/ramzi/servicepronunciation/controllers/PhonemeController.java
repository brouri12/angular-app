
package com.gestions.ramzi.servicepronunciation.controllers;

import com.gestions.ramzi.servicepronunciation.entities.Phoneme;
import com.gestions.ramzi.servicepronunciation.services.PhonemeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pronunciation")
@Tag(name = "Phonemes", description = "Bibliothèque phonèmes anglais")
@CrossOrigin(origins = "http://localhost:4200")
public class PhonemeController {

    @Autowired
    private PhonemeService phonemeService;

    @GetMapping("/phonemes")
    @Operation(summary = "Liste tous les phonèmes")
    public ResponseEntity<List<Phoneme>> getAllPhonemes() {
        return ResponseEntity.ok(phonemeService.getAllPhonemes());
    }

    @GetMapping("/phonemes/{symbol}")
    @Operation(summary = "Phonème par symbole")
    public ResponseEntity<Phoneme> getPhonemeBySymbol(@PathVariable String symbol) {
        Optional<Phoneme> phoneme = phonemeService.getPhonemeBySymbol(symbol);
        return phoneme.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
}

