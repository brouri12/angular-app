package tn.esprit.abonnement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRenewalReminderWithPromo(String toEmail, String userName, 
                                             String subscriptionName, String expirationDate, 
                                             String promoCode, double discount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("⏰ Your " + subscriptionName + " Subscription Expires Soon - Special Offer Inside!");
            helper.setFrom("marwenazouzi44@gmail.com", "E-Learning Platform");

            String htmlContent = buildRenewalEmailHtml(userName, subscriptionName, expirationDate, promoCode, discount);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✓ Renewal reminder email sent to: {}", toEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("✗ Failed to send email to: {}", toEmail, e);
        }
    }

    private String buildRenewalEmailHtml(String userName, String subscriptionName, 
                                         String expirationDate, String promoCode, double discount) {
        String discountText = String.format("%.0f%% OFF", discount);
        
        return "<!DOCTYPE html>" +
            "<html><head><meta charset=\"UTF-8\"><style>" +
            "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
            ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
            ".header { background: linear-gradient(135deg, #00c897 0%, #ff7f50 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
            ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
            ".promo-box { background: #fff; border: 3px dashed #00c897; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }" +
            ".promo-code { font-size: 32px; font-weight: bold; color: #00c897; letter-spacing: 3px; margin: 10px 0; }" +
            ".discount { font-size: 24px; color: #ff7f50; font-weight: bold; }" +
            ".button { display: inline-block; background: linear-gradient(135deg, #00c897 0%, #ff7f50 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }" +
            ".warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }" +
            ".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }" +
            "</style></head><body><div class=\"container\">" +
            "<div class=\"header\"><h1>⏰ Subscription Expiring Soon!</h1></div>" +
            "<div class=\"content\">" +
            "<p>Hi <strong>" + userName + "</strong>,</p>" +
            "<p>Your <strong>" + subscriptionName + "</strong> subscription is expiring soon!</p>" +
            "<div class=\"warning\"><strong>⚠️ Expiration Date:</strong> " + expirationDate + " (in 7 days)</div>" +
            "<p>Don't lose access to all your favorite courses and features!</p>" +
            "<h2>🎁 Special Renewal Offer - Just for You!</h2>" +
            "<div class=\"promo-box\">" +
            "<p>Use this exclusive promo code to get:</p>" +
            "<div class=\"discount\">" + discountText + "</div>" +
            "<p>Your Promo Code:</p>" +
            "<div class=\"promo-code\">" + promoCode + "</div>" +
            "<p style=\"color: #666; font-size: 14px;\">Valid for 14 days</p>" +
            "</div>" +
            "<div style=\"text-align: center;\">" +
            "<a href=\"http://localhost:4200/pricing\" class=\"button\">🔄 Renew Now & Save</a>" +
            "</div>" +
            "<h3>✨ What You'll Keep:</h3><ul>" +
            "<li>✅ Unlimited access to all courses</li>" +
            "<li>✅ Priority support 24/7</li>" +
            "<li>✅ All certificates included</li>" +
            "<li>✅ No interruption in learning</li>" +
            "</ul>" +
            "<p><strong>How to renew:</strong></p><ol>" +
            "<li>Click the \"Renew Now\" button above</li>" +
            "<li>Select your " + subscriptionName + " plan</li>" +
            "<li>Enter promo code <strong>" + promoCode + "</strong> at checkout</li>" +
            "<li>Complete payment and continue learning!</li>" +
            "</ol>" +
            "<p style=\"margin-top: 30px;\">Questions? Reply to this email or contact our support team.</p>" +
            "<p>Best regards,<br><strong>E-Learning Platform Team</strong></p>" +
            "</div>" +
            "<div class=\"footer\">" +
            "<p>© 2026 E-Learning Platform. All rights reserved.</p>" +
            "<p>You received this email because your subscription is expiring soon.</p>" +
            "</div></div></body></html>";
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("marwenazouzi44@gmail.com");
            
            mailSender.send(message);
            log.info("✓ Email sent to: {}", to);
        } catch (Exception e) {
            log.error("✗ Failed to send email to: {}", to, e);
        }
    }
}
