package com.esprit.demo.controllers;

import com.esprit.demo.dto.AnswerDTO;
import com.esprit.demo.dto.AnswerResponseDTO;
import com.esprit.demo.dto.ScoreResponseDTO;
import com.esprit.demo.entity.Answer;
import com.esprit.demo.entity.AutomaticScoringService;
import com.esprit.demo.entity.Evaluation;
import com.esprit.demo.entity.Note;
import com.esprit.demo.entity.QuestionSection;
import com.esprit.demo.repository.EvaluationRepo;
import com.esprit.demo.service.AnswerService;
import com.esprit.demo.service.NoteService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;


@CrossOrigin(origins = "*")
@RestController
@AllArgsConstructor
@RequestMapping("/answer")
public class AnswerController {
    final AnswerService answerService;
    final EvaluationRepo evaluationRepo;
    final AutomaticScoringService scoringService;
    final NoteService noteService;

    @PostMapping("/add")
    public ResponseEntity<ScoreResponseDTO> addAnswer(@RequestBody AnswerDTO answerDTO) {
        Answer answer = new Answer();
        answer.setAnswer(answerDTO.getAnswer());
        
        if (answerDTO.getIdEval() != null) {
            Evaluation evaluation = evaluationRepo.findById(answerDTO.getIdEval())
                    .orElseThrow(() -> new RuntimeException("Evaluation not found"));
            answer.setEval(evaluation);
        }
        
        // Save answer first
        Answer savedAnswer = answerService.addAnswer(answer);
        
        // Calculate score using automatic scoring service
        ScoreResponseDTO scoreResponse = scoringService.scoreAnswer(savedAnswer);
        
        // Create and save note
        Note note = new Note();
        note.setValue(scoreResponse.getTotalScore());
        note.setAnswer(savedAnswer);
        note.setEvaluation(savedAnswer.getEval());
        note.setSection(QuestionSection.GRAMMAR); // Default section
        noteService.addNote(note);
        
        return ResponseEntity.ok(scoreResponse);
    }

    @PutMapping("/update")
    public ResponseEntity<AnswerResponseDTO> updateAnswer(@RequestBody AnswerDTO answerDTO) {
        Answer answer = answerService.getEvalById(answerDTO.getIdAnswer());
        answer.setAnswer(answerDTO.getAnswer());
        
        if (answerDTO.getIdEval() != null) {
            Evaluation evaluation = evaluationRepo.findById(answerDTO.getIdEval())
                    .orElseThrow(() -> new RuntimeException("Evaluation not found"));
            answer.setEval(evaluation);
        }
        
        Answer updatedAnswer = answerService.updateAnswer(answer);
        
        AnswerResponseDTO response = new AnswerResponseDTO(
            updatedAnswer.getIdAnswer(),
            updatedAnswer.getAnswer(),
            updatedAnswer.getEval() != null ? updatedAnswer.getEval().getIdEval() : null
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllAnswers() {
        try {
            List<Answer> answers = answerService.getAllAnswers();
            System.out.println("Found " + answers.size() + " answers");
            
            List<AnswerResponseDTO> response = answers.stream()
                .map(answer -> {
                    try {
                        Long evalId = null;
                        if (answer.getEval() != null) {
                            evalId = answer.getEval().getIdEval();
                        }
                        return new AnswerResponseDTO(
                            answer.getIdAnswer(),
                            answer.getAnswer(),
                            evalId
                        );
                    } catch (Exception e) {
                        System.err.println("Error mapping answer " + answer.getIdAnswer() + ": " + e.getMessage());
                        return new AnswerResponseDTO(
                            answer.getIdAnswer(),
                            answer.getAnswer(),
                            null
                        );
                    }
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting all answers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all/{idAnswer}")
    public AnswerResponseDTO getEvalById(@PathVariable Long idAnswer) {
        Answer answer = answerService.getEvalById(idAnswer);
        return new AnswerResponseDTO(
            answer.getIdAnswer(),
            answer.getAnswer(),
            answer.getEval() != null ? answer.getEval().getIdEval() : null
        );
    }

    @DeleteMapping("/delete/{idAnswer}")
    public void deleteAnswer(@PathVariable Long idAnswer) {
        answerService.deleteAnswer(idAnswer);
    }
    
    // Debug endpoint to check evaluation correct answers
    @GetMapping("/debug/evaluation/{idEval}")
    public ResponseEntity<?> debugEvaluation(@PathVariable Long idEval) {
        Evaluation evaluation = evaluationRepo.findById(idEval)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
            put("idEval", evaluation.getIdEval());
            put("title", evaluation.getTitle());
            put("correctAnswers", evaluation.getCorrectAnswers());
            put("correctAnswersIsNull", evaluation.getCorrectAnswers() == null);
            put("correctAnswersIsEmpty", evaluation.getCorrectAnswers() != null && evaluation.getCorrectAnswers().trim().isEmpty());
            put("grammarWeight", evaluation.getGrammarWeight());
            put("listeningWeight", evaluation.getListeningWeight());
            put("essayWeight", evaluation.getEssayWeight());
        }});
    }
}
