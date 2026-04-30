package com.gestions.ramzi.servicefeedback.controllers;

import com.gestions.ramzi.servicefeedback.services.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
        logger.info("ReportController initialized with ReportService: {}", reportService != null ? "OK" : "NULL");
    }

    /**
     * Health check endpoint for reports
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "ReportService");
        health.put("reportService", reportService != null ? "initialized" : "NOT_INITIALIZED");
        
        logger.info("Health check called - ReportService: {}", reportService);
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/feedbacks/excel")
    public ResponseEntity<byte[]> downloadFeedbacksExcel() {
        try {
            logger.info("Generating feedbacks Excel report...");
            byte[] excel = reportService.generateFeedbacksExcel();
            logger.info("Excel report generated successfully, size: {} bytes", excel.length);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"rapport_feedbacks.xlsx\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excel);
        } catch (Exception e) {
            logger.error("Error generating feedbacks Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Excel report: " + e.getMessage(), e);
        }
    }

    @GetMapping("/feedbacks/pdf")
    public ResponseEntity<byte[]> downloadFeedbacksPdf() {
        try {
            logger.info("Generating feedbacks PDF report...");
            byte[] pdf = reportService.generateFeedbacksPdf();
            logger.info("PDF report generated successfully, size: {} bytes", pdf.length);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"rapport_feedbacks.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            logger.error("Error generating feedbacks PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF report: " + e.getMessage(), e);
        }
    }

    @GetMapping("/reclamations/excel")
    public ResponseEntity<byte[]> downloadReclamationsExcel() {
        try {
            logger.info("Generating reclamations Excel report...");
            byte[] excel = reportService.generateReclamationsExcel();
            logger.info("Excel report generated successfully, size: {} bytes", excel.length);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"rapport_reclamations.xlsx\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excel);
        } catch (Exception e) {
            logger.error("Error generating reclamations Excel: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Excel report: " + e.getMessage(), e);
        }
    }

    @GetMapping("/reclamations/pdf")
    public ResponseEntity<byte[]> downloadReclamationsPdf() {
        try {
            logger.info("Generating reclamations PDF report...");
            byte[] pdf = reportService.generateReclamationsPdf();
            logger.info("PDF report generated successfully, size: {} bytes", pdf.length);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"rapport_reclamations.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            logger.error("Error generating reclamations PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF report: " + e.getMessage(), e);
        }
    }
}
