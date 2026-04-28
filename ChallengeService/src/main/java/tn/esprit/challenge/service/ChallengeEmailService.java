package tn.esprit.challenge.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import tn.esprit.challenge.dto.GlobalStatsDTO;
import tn.esprit.challenge.entity.WeeklyLeaderboard;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Email service for the ChallengeService.
 * Handles:
 *  - Streak reminder emails (sent to users who haven't played in 3+ days)
 *  - Weekly admin report emails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChallengeEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    private static final String FROM = "marwenazouzi44@gmail.com";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ══════════════════════════════════════════════════════════════════════════
    // STREAK REMINDER
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Send a streak reminder to a user who hasn't submitted a challenge in 3+ days.
     *
     * @param toEmail   user's email address
     * @param userId    user ID (for display)
     * @param streak    current streak count (0 if broken)
     * @param daysSince number of days since last submission
     */
    public void sendStreakReminder(String toEmail, Long userId, int streak, long daysSince) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setFrom(FROM, "Wordly Challenges");
            helper.setSubject(streak > 0
                    ? "🔥 Don't break your " + streak + "-day streak!"
                    : "📚 Come back and start a new streak!");

            helper.setText(buildStreakReminderHtml(userId, streak, daysSince), true);
            mailSender.send(message);
            log.info("✅ Streak reminder sent to user {} ({})", userId, toEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("❌ Failed to send streak reminder to {}: {}", toEmail, e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // WEEKLY ADMIN REPORT
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Send the weekly statistics report to the admin.
     *
     * @param stats       global stats for the past week
     * @param topEntries  top 5 leaderboard entries for the week
     * @param weekStart   Monday of the week
     * @param weekEnd     Sunday of the week
     * @param newChallengeTitle title of the challenge created this week
     */
    public void sendWeeklyAdminReport(GlobalStatsDTO stats,
                                      List<WeeklyLeaderboard> topEntries,
                                      LocalDate weekStart,
                                      LocalDate weekEnd,
                                      String newChallengeTitle) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(adminEmail);
            helper.setFrom(FROM, "Wordly Admin Reports");
            helper.setSubject("📊 Weekly Challenge Report — " + weekStart.format(DATE_FMT)
                    + " → " + weekEnd.format(DATE_FMT));

            helper.setText(buildWeeklyReportHtml(stats, topEntries, weekStart, weekEnd, newChallengeTitle), true);
            mailSender.send(message);
            log.info("✅ Weekly admin report sent to {}", adminEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("❌ Failed to send weekly report: {}", e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HTML BUILDERS
    // ══════════════════════════════════════════════════════════════════════════

    private String buildStreakReminderHtml(Long userId, int streak, long daysSince) {
        String streakMsg = streak > 0
                ? "You have a <strong>" + streak + "-day streak</strong> — don't let it disappear!"
                : "You haven't played in <strong>" + daysSince + " days</strong>. Start a new streak today!";

        String emoji = streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "📚";

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>"
                + "body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}"
                + ".wrap{max-width:560px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}"
                + ".header{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:32px;text-align:center}"
                + ".header h1{margin:0;font-size:28px}" 
                + ".body{padding:28px}"
                + ".cta{display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0}"
                + ".footer{text-align:center;color:#999;font-size:12px;padding:16px}"
                + ".stat{background:#f0f0ff;border-left:4px solid #6366f1;padding:12px 16px;border-radius:6px;margin:16px 0}"
                + "</style></head><body><div class='wrap'>"
                + "<div class='header'><div style='font-size:48px'>" + emoji + "</div>"
                + "<h1>Keep Learning!</h1></div>"
                + "<div class='body'>"
                + "<p>Hi there 👋,</p>"
                + "<p>" + streakMsg + "</p>"
                + "<div class='stat'>⏱️ Last activity: <strong>" + daysSince + " day(s) ago</strong></div>"
                + "<p>A new challenge is waiting for you. It only takes 15 minutes!</p>"
                + "<div style='text-align:center'>"
                + "<a href='" + frontendUrl + "/challenges' class='cta'>🎯 Take a Challenge Now</a>"
                + "</div>"
                + "<p style='color:#666;font-size:13px'>Consistent practice is the fastest way to improve your English. Even one challenge a day makes a huge difference.</p>"
                + "</div>"
                + "<div class='footer'>© 2026 Wordly Platform · <a href='" + frontendUrl + "'>Visit Platform</a></div>"
                + "</div></body></html>";
    }

    private String buildWeeklyReportHtml(GlobalStatsDTO stats,
                                         List<WeeklyLeaderboard> top,
                                         LocalDate weekStart,
                                         LocalDate weekEnd,
                                         String newChallengeTitle) {
        StringBuilder leaderboardRows = new StringBuilder();
        String[] medals = {"🥇", "🥈", "🥉", "4️⃣", "5️⃣"};
        for (int i = 0; i < top.size(); i++) {
            WeeklyLeaderboard e = top.get(i);
            String medal = i < medals.length ? medals[i] : "#" + (i + 1);
            leaderboardRows.append("<tr>")
                    .append("<td style='padding:8px 12px;text-align:center'>").append(medal).append("</td>")
                    .append("<td style='padding:8px 12px'>User #").append(e.getUserId()).append("</td>")
                    .append("<td style='padding:8px 12px;text-align:right;font-weight:bold;color:#6366f1'>").append(e.getTotalScore()).append("</td>")
                    .append("<td style='padding:8px 12px;text-align:right'>").append(e.getChallengesPassed()).append("</td>")
                    .append("<td style='padding:8px 12px;text-align:right'>").append(String.format("%.1f%%", e.getPassRate())).append("</td>")
                    .append("</tr>");
        }
        if (top.isEmpty()) {
            leaderboardRows.append("<tr><td colspan='5' style='padding:16px;text-align:center;color:#999'>No submissions this week</td></tr>");
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>"
                + "body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}"
                + ".wrap{max-width:640px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)}"
                + ".header{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:32px;text-align:center}"
                + ".header h1{margin:0;font-size:26px}"
                + ".section{padding:24px 28px;border-bottom:1px solid #f0f0f0}"
                + ".kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}"
                + ".kpi{background:#f8f8ff;border-radius:8px;padding:16px;text-align:center}"
                + ".kpi .val{font-size:28px;font-weight:bold;color:#6366f1}"
                + ".kpi .lbl{font-size:12px;color:#666;margin-top:4px}"
                + "table{width:100%;border-collapse:collapse}"
                + "thead tr{background:#f0f0ff}"
                + "th{padding:10px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase}"
                + "tbody tr:hover{background:#fafafa}"
                + ".badge{display:inline-block;background:#e0e7ff;color:#6366f1;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:bold}"
                + ".footer{text-align:center;color:#999;font-size:12px;padding:20px}"
                + "</style></head><body><div class='wrap'>"

                // Header
                + "<div class='header'>"
                + "<div style='font-size:40px'>📊</div>"
                + "<h1>Weekly Challenge Report</h1>"
                + "<p style='margin:4px 0;opacity:.85'>"
                + weekStart.format(DATE_FMT) + " → " + weekEnd.format(DATE_FMT)
                + "</p></div>"

                // KPIs
                + "<div class='section'><h2 style='margin-top:0'>Platform Overview</h2>"
                + "<div class='kpi-grid'>"
                + kpi(String.valueOf(stats.getTotalSubmissions()), "Total Submissions")
                + kpi(String.valueOf(stats.getTotalPassedSubmissions()), "Passed")
                + kpi(String.format("%.1f%%", stats.getGlobalPassRate()), "Pass Rate")
                + kpi(String.format("%.1f", stats.getGlobalAverageScore()), "Avg Score")
                + "</div></div>"

                // New challenge
                + "<div class='section'>"
                + "<h2 style='margin-top:0'>🆕 New Challenge This Week</h2>"
                + "<p><span class='badge'>AUTO-GENERATED</span> &nbsp;"
                + "<strong>" + newChallengeTitle + "</strong></p>"
                + "</div>"

                // Leaderboard
                + "<div class='section'>"
                + "<h2 style='margin-top:0'>🏆 Weekly Top 5</h2>"
                + "<table><thead><tr>"
                + "<th>Rank</th><th>User</th><th>Score</th><th>Passed</th><th>Pass Rate</th>"
                + "</tr></thead><tbody>"
                + leaderboardRows
                + "</tbody></table></div>"

                // Footer
                + "<div class='footer'>"
                + "© 2026 Wordly Platform · Admin Report · "
                + "<a href='" + frontendUrl + "'>Visit Platform</a>"
                + "</div></div></body></html>";
    }

    private String kpi(String value, String label) {
        return "<div class='kpi'><div class='val'>" + value + "</div><div class='lbl'>" + label + "</div></div>";
    }
}
