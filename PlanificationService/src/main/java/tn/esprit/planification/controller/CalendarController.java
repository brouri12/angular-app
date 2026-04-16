package tn.esprit.planification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.planification.service.CalendarService;
import tn.esprit.planification.service.PdfService;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {
    
    private final CalendarService calendarService;
    private final PdfService pdfService;
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<String> getStudentCalendar(@PathVariable Long studentId) {
        String icalContent = calendarService.generateICalForStudent(studentId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar"));
        headers.setContentDispositionFormData("attachment", "my-schedule.ics");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(icalContent);
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<String> getTeacherCalendar(@PathVariable Long teacherId) {
        String icalContent = calendarService.generateICalForTeacher(teacherId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar"));
        headers.setContentDispositionFormData("attachment", "teaching-schedule.ics");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(icalContent);
    }
    
    @GetMapping("/group/{groupId}")
    public ResponseEntity<String> getGroupCalendar(@PathVariable Long groupId) {
        String icalContent = calendarService.generateICalForGroup(groupId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar"));
        headers.setContentDispositionFormData("attachment", "group-schedule.ics");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(icalContent);
    }
    
    // PDF Endpoints
    @GetMapping("/student/{studentId}/pdf")
    public ResponseEntity<byte[]> getStudentCalendarPdf(@PathVariable Long studentId) {
        byte[] pdfContent = pdfService.generatePdfForStudent(studentId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "my-schedule.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
    
    @GetMapping("/teacher/{teacherId}/pdf")
    public ResponseEntity<byte[]> getTeacherCalendarPdf(@PathVariable Long teacherId) {
        byte[] pdfContent = pdfService.generatePdfForTeacher(teacherId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "teaching-schedule.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
    
    @GetMapping("/group/{groupId}/pdf")
    public ResponseEntity<byte[]> getGroupCalendarPdf(@PathVariable Long groupId) {
        byte[] pdfContent = pdfService.generatePdfForGroup(groupId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "group-schedule.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
}
