package com.esprit.demo.service;

import com.esprit.demo.entity.Evaluation;
import com.esprit.demo.entity.EvaluationStatus;
import com.esprit.demo.repository.EvaluationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImp implements IEvaluationService {
    private final EvaluationRepo evaluationRepo;
    private final EvaluationSchedulerService schedulerService;

    @Override
    @Transactional
    public Evaluation addEval(Evaluation evaluation) {
        // Set default status if not provided
        if (evaluation.getStatus() == null) {
            evaluation.setStatus(EvaluationStatus.OPEN);
        }
        
        // Save evaluation
        Evaluation savedEval = evaluationRepo.save(evaluation);
        
        // Schedule automatic closing if status is OPEN and deadline is set
        if (savedEval.getStatus() == EvaluationStatus.OPEN && savedEval.getDeadline() != null) {
            if (savedEval.getDeadline().isAfter(LocalDateTime.now())) {
                schedulerService.scheduleEvaluationClosing(savedEval);
            } else {
                // Deadline already passed - close immediately
                schedulerService.closeEvaluation(savedEval.getIdEval());
            }
        }
        
        return savedEval;
    }

    @Override
    @Transactional
    public Evaluation updateEval(Evaluation evaluation) {
        Evaluation existingEval = evaluationRepo.findById(evaluation.getIdEval())
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));
        
        LocalDateTime oldDeadline = existingEval.getDeadline();
        EvaluationStatus oldStatus = existingEval.getStatus();
        
        // Update evaluation
        Evaluation updatedEval = evaluationRepo.save(evaluation);
        
        // Handle scheduling based on status and deadline changes
        if (updatedEval.getStatus() == EvaluationStatus.OPEN) {
            if (updatedEval.getDeadline() != null) {
                // Deadline changed or status changed to OPEN
                if (!updatedEval.getDeadline().equals(oldDeadline) || oldStatus != EvaluationStatus.OPEN) {
                    if (updatedEval.getDeadline().isAfter(LocalDateTime.now())) {
                        schedulerService.rescheduleEvaluationClosing(updatedEval);
                    } else {
                        schedulerService.closeEvaluation(updatedEval.getIdEval());
                    }
                }
            }
        } else {
            // Status is CLOSED - cancel any scheduled task
            schedulerService.cancelScheduledTask(updatedEval.getIdEval());
        }
        
        return updatedEval;
    }

    @Override
    public List<Evaluation> getAllEvals() {
        return evaluationRepo.findAll();
    }

    @Override
    public List<Evaluation> getOpenEvaluations() {
        // Using JPQL query from repository
        return evaluationRepo.findOpenEvaluations();
    }


    @Override
    public Evaluation getEvalById(Long idEval) {
        return evaluationRepo.findById(idEval).orElse(null);
    }

    @Override
    @Transactional
    public void deleteEval(Long idEval) {
        // Cancel scheduled task before deleting
        schedulerService.cancelScheduledTask(idEval);
        evaluationRepo.deleteById(idEval);
    }

}
