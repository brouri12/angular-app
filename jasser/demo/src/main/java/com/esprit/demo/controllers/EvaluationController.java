package com.esprit.demo.controllers;

import com.esprit.demo.entity.Evaluation;
import com.esprit.demo.service.EvaluationSchedulerService;
import com.esprit.demo.service.EvaluationServiceImp;
import com.esprit.demo.service.IEvaluationService;
import lombok.AllArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@AllArgsConstructor
@RequestMapping("/eval")
public class EvaluationController implements IEvaluationService {
    final EvaluationServiceImp evaluationServiceImp;
    final EvaluationSchedulerService schedulerService;

    @GetMapping("/test")
    public String test() {
        return "Evaluation API is working!";
    }

    @PostMapping("/add")
    public Evaluation addEval(@RequestBody Evaluation evaluation) {
        return evaluationServiceImp.addEval(evaluation);
    }

    @PutMapping("/update")
    public Evaluation updateEval(@RequestBody Evaluation evaluation) {
        return evaluationServiceImp.updateEval(evaluation);
    }

    @GetMapping("/all")
    public List<Evaluation> getAllEvals() {
        return evaluationServiceImp.getAllEvals();
    }

    @GetMapping("/open")
    public List<Evaluation> getOpenEvaluations() {
        return evaluationServiceImp.getOpenEvaluations();
    }


    @GetMapping("/all/{idEval}")
    public Evaluation getEvalById(Long idEval) {
        return evaluationServiceImp.getEvalById(idEval);
    }

    @DeleteMapping("delete/{idEval}")
    public void deleteEval(@PathVariable Long idEval) {
        evaluationServiceImp.deleteEval(idEval);
    }

    // New endpoints for scheduler management
    
    @PostMapping("/close/{idEval}")
    public ResponseEntity<Map<String, String>> closeEvaluation(@PathVariable Long idEval) {
        schedulerService.manuallyCloseEvaluation(idEval);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Evaluation closed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancel-schedule/{idEval}")
    public ResponseEntity<Map<String, String>> cancelSchedule(@PathVariable Long idEval) {
        schedulerService.cancelScheduledTask(idEval);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Scheduled task cancelled successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/scheduler/status/{idEval}")
    public ResponseEntity<Map<String, Object>> getSchedulerStatus(@PathVariable Long idEval) {
        Map<String, Object> response = new HashMap<>();
        response.put("isScheduled", schedulerService.isScheduled(idEval));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/scheduler/stats")
    public ResponseEntity<Map<String, Object>> getSchedulerStats() {
        Map<String, Object> response = new HashMap<>();
        response.put("scheduledTasksCount", schedulerService.getScheduledTasksCount());
        return ResponseEntity.ok(response);
    }
}
