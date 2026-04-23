package tn.esprit.memberservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendHtmlWithInlineQr(String to, String subject, String htmlContent, byte[] qrPngBytes)
            throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);

        // HTML
        helper.setText(htmlContent, true);

        // ✅ Inline image (cid:qr)
        helper.addInline("qr", new ByteArrayResource(qrPngBytes), "image/png");

        mailSender.send(message);
    }
}