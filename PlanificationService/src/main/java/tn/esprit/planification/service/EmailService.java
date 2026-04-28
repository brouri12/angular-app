package tn.esprit.planification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public void sendScheduleNotification(String to, String studentName, String scheduleDetails) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("New Schedule Created - Wordly Language School");
            message.setText(buildEmailContent(studentName, scheduleDetails));
            
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // Don't throw exception - email failure shouldn't break schedule creation
        }
    }
    
    private String buildEmailContent(String studentName, String scheduleDetails) {
        return String.format("""
            Hello %s,
            
            A new schedule has been created for your group!
            
            %s
            
            Please check your student portal for more details.
            
            Best regards,
            Wordly Language School
            """, studentName, scheduleDetails);
    }
}
