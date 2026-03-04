package com.esprit.demo.service;

import com.esprit.demo.entity.Evaluation;
import com.esprit.demo.entity.EvaluationStatus;
import com.esprit.demo.repository.EvaluationRepo;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationSchedulerService {

    private final EvaluationRepo evaluationRepo;
    private final TaskScheduler taskScheduler;
    
    // Thread-safe map to track scheduled tasks
    private final ConcurrentHashMap<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    /**
     * On application startup, schedule all OPEN evaluations
     */
    @PostConstruct
    public void initializeScheduledTasks() {
        log.info("Initializing evaluation scheduler...");
        
        // First, update any evaluations with NULL status to OPEN
        List<Evaluation> allEvaluations = evaluationRepo.findAll();
        for (Evaluation eval : allEvaluations) {
            if (eval.getStatus() == null) {
                log.info("Setting status to OPEN for evaluation {} (was NULL)", eval.getIdEval());
                eval.setStatus(EvaluationStatus.OPEN);
                evaluationRepo.save(eval);
            }
        }
        
        List<Evaluation> openEvaluations = evaluationRepo.findByStatus(EvaluationStatus.OPEN);
        log.info("Found {} OPEN evaluations to schedule", openEvaluations.size());
        
        for (Evaluation evaluation : openEvaluations) {
            LocalDateTime deadline = evaluation.getDeadline();
            
            // Skip evaluations without a deadline
            if (deadline == null) {
                log.info("Evaluation {} has no deadline, skipping scheduling", evaluation.getIdEval());
                continue;
            }
            
            LocalDateTime now = LocalDateTime.now();
            
            if (deadline.isBefore(now)) {
                // Deadline already passed - close immediately
                log.info("Evaluation {} deadline already passed. Closing immediately.", evaluation.getIdEval());
                closeEvaluation(evaluation.getIdEval());
            } else {
                // Schedule for future closing
                scheduleEvaluationClosing(evaluation);
            }
        }
        
        log.info("Evaluation scheduler initialized successfully");
    }

    /**
     * Schedule a task to close an evaluation at its deadline
     */
    public void scheduleEvaluationClosing(Evaluation evaluation) {
        if (evaluation.getStatus() != EvaluationStatus.OPEN) {
            log.warn("Cannot schedule closing for evaluation {} - status is not OPEN", evaluation.getIdEval());
            return;
        }
        
        if (evaluation.getDeadline() == null) {
            log.warn("Cannot schedule closing for evaluation {} - deadline is null", evaluation.getIdEval());
            return;
        }
        
        // Cancel existing task if any
        cancelScheduledTask(evaluation.getIdEval());
        
        // Convert LocalDateTime to Instant
        Instant deadlineInstant = evaluation.getDeadline()
                .atZone(ZoneId.systemDefault())
                .toInstant();
        
        // Schedule the closing task
        ScheduledFuture<?> scheduledTask = taskScheduler.schedule(
            () -> closeEvaluation(evaluation.getIdEval()),
            deadlineInstant
        );
        
        // Store the scheduled task
        scheduledTasks.put(evaluation.getIdEval(), scheduledTask);
        
        log.info("Scheduled closing for evaluation {} at {}", 
                evaluation.getIdEval(), evaluation.getDeadline());
    }

    /**
     * Reschedule an evaluation (used when deadline is updated)
     */
    public void rescheduleEvaluationClosing(Evaluation evaluation) {
        log.info("Rescheduling evaluation {}", evaluation.getIdEval());
        cancelScheduledTask(evaluation.getIdEval());
        scheduleEvaluationClosing(evaluation);
    }

    /**
     * Cancel a scheduled task for an evaluation
     */
    public void cancelScheduledTask(Long evaluationId) {
        ScheduledFuture<?> scheduledTask = scheduledTasks.remove(evaluationId);
        
        if (scheduledTask != null && !scheduledTask.isDone()) {
            boolean cancelled = scheduledTask.cancel(false);
            log.info("Cancelled scheduled task for evaluation {}: {}", evaluationId, cancelled);
        }
    }

    /**
     * Close an evaluation (called by scheduled task)
     */
    @Transactional
    public void closeEvaluation(Long evaluationId) {
        try {
            Evaluation evaluation = evaluationRepo.findById(evaluationId)
                    .orElse(null);
            
            if (evaluation == null) {
                log.warn("Evaluation {} not found - cannot close", evaluationId);
                scheduledTasks.remove(evaluationId);
                return;
            }
            
            if (evaluation.getStatus() == EvaluationStatus.CLOSED) {
                log.info("Evaluation {} is already closed", evaluationId);
                scheduledTasks.remove(evaluationId);
                return;
            }
            
            // Update status to CLOSED
            evaluation.setStatus(EvaluationStatus.CLOSED);
            evaluationRepo.save(evaluation);
            
            // Remove from scheduled tasks
            scheduledTasks.remove(evaluationId);
            
            log.info("Successfully closed evaluation {} at {}", 
                    evaluationId, LocalDateTime.now());
            
        } catch (Exception e) {
            log.error("Error closing evaluation {}: {}", evaluationId, e.getMessage(), e);
        }
    }

    /**
     * Manually close an evaluation (can be called from controller)
     */
    @Transactional
    public void manuallyCloseEvaluation(Long evaluationId) {
        cancelScheduledTask(evaluationId);
        closeEvaluation(evaluationId);
    }

    /**
     * Get count of currently scheduled tasks
     */
    public int getScheduledTasksCount() {
        return scheduledTasks.size();
    }

    /**
     * Check if an evaluation has a scheduled task
     */
    public boolean isScheduled(Long evaluationId) {
        return scheduledTasks.containsKey(evaluationId);
    }

    /**
     * Clean up on application shutdown
     */
    @PreDestroy
    public void cleanup() {
        log.info("Cleaning up scheduled tasks...");
        scheduledTasks.values().forEach(task -> {
            if (!task.isDone()) {
                task.cancel(false);
            }
        });
        scheduledTasks.clear();
        log.info("Cleanup completed");
    }
}
