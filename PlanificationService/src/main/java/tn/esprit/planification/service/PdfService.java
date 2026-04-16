package tn.esprit.planification.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.planification.client.UserClient;
import tn.esprit.planification.entity.Planification;
import tn.esprit.planification.entity.Salle;
import tn.esprit.planification.repository.PlanificationRepository;

import java.io.ByteArrayOutputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PdfService {
    
    private final PlanificationRepository planificationRepository;
    private final UserClient userClient;
    
    public byte[] generatePdfForStudent(Long studentId) {
        try {
            List<Planification> schedules = planificationRepository.findAll().stream()
                .filter(p -> p.getGroup() != null && 
                            p.getGroup().getStudentIds() != null &&
                            p.getGroup().getStudentIds().contains(studentId))
                .collect(Collectors.toList());
            
            UserClient.UserDTO student = userClient.getUserById(studentId);
            String studentName = student != null ? student.getFullName() : "Student";
            
            return buildWeeklyCalendarPdf(schedules, "My Weekly Schedule", studentName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }
    
    public byte[] generatePdfForTeacher(Long teacherId) {
        try {
            List<Planification> schedules = planificationRepository.findAll().stream()
                .filter(p -> p.getGroup() != null && 
                            p.getGroup().getTeacherId() != null &&
                            p.getGroup().getTeacherId().equals(teacherId))
                .collect(Collectors.toList());
            
            UserClient.UserDTO teacher = userClient.getUserById(teacherId);
            String teacherName = teacher != null ? teacher.getFullName() : "Teacher";
            
            return buildWeeklyCalendarPdf(schedules, "My Teaching Schedule", teacherName);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }
    
    public byte[] generatePdfForGroup(Long groupId) {
        try {
            List<Planification> schedules = planificationRepository.findAll().stream()
                .filter(p -> p.getGroup() != null && 
                            p.getGroup().getId() != null &&
                            p.getGroup().getId().equals(groupId))
                .collect(Collectors.toList());
            
            return buildWeeklyCalendarPdf(schedules, "Group Schedule", "Group #" + groupId);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }
    
    private byte[] buildWeeklyCalendarPdf(List<Planification> schedules, String title, String subtitle) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // Colors
            DeviceRgb primaryColor = new DeviceRgb(0, 200, 151);
            DeviceRgb headerBg = new DeviceRgb(240, 240, 240);
            DeviceRgb borderColor = new DeviceRgb(200, 200, 200);
            
            // Get current week (Monday to Sunday)
            LocalDate today = LocalDate.now();
            LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate sunday = monday.plusDays(6);
            
            // Title
            document.add(new Paragraph(title)
                .setFontSize(22)
                .setBold()
                .setFontColor(primaryColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5));
            
            // Subtitle
            document.add(new Paragraph(subtitle)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(3));
            
            // Week range
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
            document.add(new Paragraph(monday.format(dateFormatter) + " - " + sunday.format(dateFormatter))
                .setFontSize(11)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));
            
            // Filter schedules for current week
            List<Planification> weekSchedules = schedules.stream()
                .filter(s -> !s.getDate().isBefore(monday) && !s.getDate().isAfter(sunday))
                .sorted(Comparator.comparing(Planification::getDate)
                        .thenComparing(Planification::getHeureDebut))
                .collect(Collectors.toList());
            
            // Group schedules by day
            Map<LocalDate, List<Planification>> schedulesByDay = new LinkedHashMap<>();
            for (LocalDate date = monday; !date.isAfter(sunday); date = date.plusDays(1)) {
                schedulesByDay.put(date, new ArrayList<>());
            }
            for (Planification schedule : weekSchedules) {
                if (schedulesByDay.containsKey(schedule.getDate())) {
                    schedulesByDay.get(schedule.getDate()).add(schedule);
                }
            }
            
            // Create weekly calendar grid (7 columns)
            Table calendar = new Table(UnitValue.createPercentArray(7))
                .useAllAvailableWidth()
                .setMarginBottom(20);
            
            // Day headers
            String[] dayNames = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
            DateTimeFormatter dayDateFormat = DateTimeFormatter.ofPattern("dd/MM");
            
            for (int i = 0; i < 7; i++) {
                LocalDate date = monday.plusDays(i);
                boolean isToday = date.equals(today);
                
                Cell headerCell = new Cell()
                    .add(new Paragraph(dayNames[i]).setBold().setFontSize(10))
                    .add(new Paragraph(date.format(dayDateFormat)).setFontSize(8))
                    .setBackgroundColor(isToday ? primaryColor : headerBg)
                    .setFontColor(isToday ? ColorConstants.WHITE : ColorConstants.BLACK)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(8)
                    .setBorder(new SolidBorder(borderColor, 1));
                
                calendar.addHeaderCell(headerCell);
            }
            
            // Day cells with schedules
            for (int i = 0; i < 7; i++) {
                LocalDate date = monday.plusDays(i);
                List<Planification> daySchedules = schedulesByDay.get(date);
                
                Cell dayCell = new Cell()
                    .setMinHeight(150)
                    .setVerticalAlignment(VerticalAlignment.TOP)
                    .setPadding(5)
                    .setBorder(new SolidBorder(borderColor, 1));
                
                if (daySchedules == null || daySchedules.isEmpty()) {
                    dayCell.add(new Paragraph("No classes")
                        .setFontSize(9)
                        .setFontColor(ColorConstants.GRAY)
                        .setItalic()
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginTop(50));
                } else {
                    for (Planification schedule : daySchedules) {
                        dayCell.add(createScheduleBlock(schedule));
                    }
                }
                
                calendar.addCell(dayCell);
            }
            
            document.add(calendar);
            
            // Summary section
            if (!weekSchedules.isEmpty()) {
                document.add(new Paragraph("Schedule Details")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setMarginTop(10)
                    .setMarginBottom(10));
                
                // Details table
                Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 3, 2}))
                    .useAllAvailableWidth();
                
                // Headers
                detailsTable.addHeaderCell(createHeaderCell("Date", headerBg));
                detailsTable.addHeaderCell(createHeaderCell("Time", headerBg));
                detailsTable.addHeaderCell(createHeaderCell("Title", headerBg));
                detailsTable.addHeaderCell(createHeaderCell("Room", headerBg));
                detailsTable.addHeaderCell(createHeaderCell("Type", headerBg));
                
                DateTimeFormatter detailDateFormatter = DateTimeFormatter.ofPattern("EEE dd/MM");
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
                
                for (Planification schedule : weekSchedules) {
                    detailsTable.addCell(new Cell().add(new Paragraph(schedule.getDate().format(detailDateFormatter)).setFontSize(9)));
                    
                    String timeStr = schedule.getHeureDebut().format(timeFormatter) + 
                                   " - " + 
                                   schedule.getHeureFin().format(timeFormatter);
                    detailsTable.addCell(new Cell().add(new Paragraph(timeStr).setFontSize(9)));
                    
                    detailsTable.addCell(new Cell().add(new Paragraph(schedule.getTitre()).setFontSize(9)));
                    
                    Salle salle = schedule.getSalle();
                    String roomStr = salle != null ? salle.getNomSalle() : "N/A";
                    detailsTable.addCell(new Cell().add(new Paragraph(roomStr).setFontSize(9)));
                    
                    detailsTable.addCell(new Cell().add(new Paragraph(schedule.getType().toString()).setFontSize(9)));
                }
                
                document.add(detailsTable);
            }
            
            // Footer
            document.add(new Paragraph("\nTotal Classes This Week: " + weekSchedules.size())
                .setFontSize(10)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(15)
                .setFontColor(primaryColor));
            
            document.add(new Paragraph("Wordly Language School")
                .setFontSize(9)
                .setItalic()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(5));
            
            document.close();
            
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
        
        return baos.toByteArray();
    }
    
    private Paragraph createScheduleBlock(Planification schedule) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        String timeStr = schedule.getHeureDebut().format(timeFormatter) + 
                        "-" + 
                        schedule.getHeureFin().format(timeFormatter);
        
        Salle salle = schedule.getSalle();
        String roomStr = salle != null ? salle.getNomSalle() : "Room";
        
        // Create colored block based on type
        DeviceRgb blockColor = getTypeColor(schedule.getType().toString());
        
        Paragraph block = new Paragraph()
            .add(new Paragraph(timeStr)
                .setFontSize(8)
                .setBold()
                .setMarginBottom(2))
            .add(new Paragraph(schedule.getTitre())
                .setFontSize(9)
                .setBold()
                .setMarginBottom(1))
            .add(new Paragraph(roomStr)
                .setFontSize(7)
                .setMarginBottom(1))
            .add(new Paragraph(schedule.getType().toString())
                .setFontSize(7)
                .setItalic())
            .setBackgroundColor(blockColor)
            .setPadding(5)
            .setMarginBottom(3);
        
        return block;
    }
    
    private DeviceRgb getTypeColor(String type) {
        switch (type) {
            case "COURS":
                return new DeviceRgb(200, 230, 255); // Light blue
            case "EXAMEN":
                return new DeviceRgb(255, 200, 200); // Light red
            case "REUNION":
                return new DeviceRgb(255, 240, 200); // Light yellow
            default:
                return new DeviceRgb(230, 255, 245); // Light green
        }
    }
    
    private Cell createHeaderCell(String text, DeviceRgb bgColor) {
        return new Cell()
            .add(new Paragraph(text).setBold().setFontSize(10))
            .setBackgroundColor(bgColor)
            .setTextAlignment(TextAlignment.CENTER)
            .setPadding(5);
    }
}
