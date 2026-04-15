package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.entities.Feedback;
import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    private final FeedbackService feedbackService;
    private final ReclamationService reclamationService;

    public ReportService(FeedbackService feedbackService, ReclamationService reclamationService) {
        this.feedbackService = feedbackService;
        this.reclamationService = reclamationService;
    }

    /**
     * Generate Excel report for feedbacks
     */
    public byte[] generateFeedbacksExcel() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Feedbacks");
            
            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "User ID", "Module ID", "Note", "Commentaire", "Date"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill data
            List<Feedback> feedbacks = feedbackService.getAll();
            int rowNum = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            
            for (Feedback feedback : feedbacks) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(feedback.getId());
                row.createCell(1).setCellValue(feedback.getUserId() != null ? feedback.getUserId() : 0);
                row.createCell(2).setCellValue(feedback.getModuleId() != null ? feedback.getModuleId() : 0);
                row.createCell(3).setCellValue(feedback.getNote());
                row.createCell(4).setCellValue(feedback.getCommentaire() != null ? feedback.getCommentaire() : "");
                row.createCell(5).setCellValue(feedback.getDate() != null ? feedback.getDate().format(formatter) : "");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel report", e);
        }
    }

    /**
     * Generate PDF report for feedbacks
     */
    public byte[] generateFeedbacksPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            Paragraph title = new Paragraph("Rapport des Feedbacks")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);
            document.add(new Paragraph("\n"));

            // Summary stats
            var stats = feedbackService.getStats(null);
            document.add(new Paragraph("Résumé des statistiques:")
                    .setFontSize(12)
                    .setBold());
            document.add(new Paragraph(String.format("- Total des feedbacks: %d", stats.getTotalFeedbacks())));
            document.add(new Paragraph(String.format("- Note moyenne: %.2f", stats.getMoyenneNote())));
            document.add(new Paragraph(String.format("- Nouveaux aujourd'hui: %d", stats.getNouveauxAujourdhui())));
            document.add(new Paragraph("\n"));

            // Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{10, 15, 15, 10, 35, 20}))
                    .useAllAvailableWidth();

            // Header
            table.addHeaderCell("ID");
            table.addHeaderCell("User ID");
            table.addHeaderCell("Module ID");
            table.addHeaderCell("Note");
            table.addHeaderCell("Commentaire");
            table.addHeaderCell("Date");

            List<Feedback> feedbacks = feedbackService.getAll();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (Feedback feedback : feedbacks) {
                table.addCell(String.valueOf(feedback.getId()));
                table.addCell(feedback.getUserId() != null ? String.valueOf(feedback.getUserId()) : "-");
                table.addCell(feedback.getModuleId() != null ? String.valueOf(feedback.getModuleId()) : "-");
                table.addCell(String.valueOf(feedback.getNote()));
                table.addCell(feedback.getCommentaire() != null ? feedback.getCommentaire() : "-");
                table.addCell(feedback.getDate() != null ? feedback.getDate().format(formatter) : "-");
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }

    /**
     * Generate Excel report for reclamations
     */
    public byte[] generateReclamationsExcel() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Reclamations");
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "User ID", "Objet", "Description", "Status", "Date"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            List<Reclamation> reclamations = reclamationService.getAll();
            int rowNum = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            
            for (Reclamation reclamation : reclamations) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(reclamation.getId());
                row.createCell(1).setCellValue(reclamation.getUserId() != null ? reclamation.getUserId() : 0);
                row.createCell(2).setCellValue(reclamation.getObjet() != null ? reclamation.getObjet() : "");
                row.createCell(3).setCellValue(reclamation.getDescription() != null ? reclamation.getDescription() : "");
                row.createCell(4).setCellValue(reclamation.getStatus() != null ? reclamation.getStatus() : "");
                row.createCell(5).setCellValue(reclamation.getDate() != null ? reclamation.getDate().format(formatter) : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel report", e);
        }
    }

    /**
     * Generate PDF report for reclamations
     */
    public byte[] generateReclamationsPdf() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            Paragraph title = new Paragraph("Rapport des Réclamations")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);
            document.add(new Paragraph("\n"));

            var analytics = reclamationService.getAnalytics(null, null);
            document.add(new Paragraph("Résumé des statistiques:")
                    .setFontSize(12)
                    .setBold());
            document.add(new Paragraph(String.format("- Total des réclamations: %d", analytics.getTotalReclamations())));
            document.add(new Paragraph(String.format("- En attente: %d", analytics.getReclamationEnAttente())));
            document.add(new Paragraph(String.format("- Résolues: %d", analytics.getReclamationResolue())));
            document.add(new Paragraph(String.format("- Temps de résolution moyen: %.2f heures", analytics.getTempsResolutionMoyen())));
            document.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[]{8, 10, 20, 30, 15, 17}))
                    .useAllAvailableWidth();

            table.addHeaderCell("ID");
            table.addHeaderCell("User ID");
            table.addHeaderCell("Objet");
            table.addHeaderCell("Description");
            table.addHeaderCell("Status");
            table.addHeaderCell("Date");

            List<Reclamation> reclamations = reclamationService.getAll();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (Reclamation reclamation : reclamations) {
                table.addCell(String.valueOf(reclamation.getId()));
                table.addCell(reclamation.getUserId() != null ? String.valueOf(reclamation.getUserId()) : "-");
                table.addCell(reclamation.getObjet() != null ? reclamation.getObjet() : "-");
                table.addCell(reclamation.getDescription() != null ? reclamation.getDescription() : "-");
                table.addCell(reclamation.getStatus() != null ? reclamation.getStatus() : "-");
                table.addCell(reclamation.getDate() != null ? reclamation.getDate().format(formatter) : "-");
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }
}
