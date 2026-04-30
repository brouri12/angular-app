package com.elearning.quizbadge.service;

import com.elearning.quizbadge.entity.Badge;
import com.elearning.quizbadge.entity.Student;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.BadgeRepository;
import com.elearning.quizbadge.repository.StudentRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Génère un certificat PDF pour un badge (équivalent Node {@code GET /api/badges/:id/certificate}).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeCertificateService {

    private static final float PAGE_W = PDRectangle.A4.getWidth();
    private static final float PAGE_H = PDRectangle.A4.getHeight();
    private static final float MARGIN_X = 50f;
    private static final Pattern DIGITS = Pattern.compile("(\\d+)");

    private final BadgeRepository badgeRepository;
    private final StudentRepository studentRepository;

    @Value("${elearning.certificate.brand-title:Jungle in English}")
    private String brandTitle;

    @Value("${elearning.certificate.subtitle:Certificate of Quiz Achievement}")
    private String subtitle;

    @Value("${elearning.certificate.footer:Authorized & verified by Jungle in English}")
    private String footerLegend;

    public record CertificatePdf(byte[] bytes, String filename) {}

    /**
     * Génère le PDF et le nom de fichier (une seule lecture du badge).
     */
    @Transactional(readOnly = true)
    public CertificatePdf buildCertificate(Long badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with ID: " + badgeId));

        String studentName = resolveStudentName(badge.getStudentId());
        String badgeName = latin1Safe(Optional.ofNullable(badge.getBadgeName()).orElse("Badge"));
        String badgeLevel = badge.getBadgeLevel() != null ? badge.getBadgeLevel().name() : "";
        String achievedPoints = extractPointsToken(badge.getCriteriaMet());
        String obtainedText = badge.getEarnedDate() != null
                ? badge.getEarnedDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "";

        String qrPayload = "Badge:" + badgeId + ":" + studentName + ":" + badgeLevel;
        LevelColors colors = colorsFor(badge.getBadgeLevel());

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                drawBackground(cs, colors);
                drawHeader(cs, colors);
                drawBody(cs, doc, badgeName, badgeLevel, studentName, achievedPoints, obtainedText, qrPayload);
                drawSignaturePanel(cs);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            String filename = safeCertificateFilename(badge.getBadgeName());
            return new CertificatePdf(out.toByteArray(), filename);
        } catch (IOException | WriterException e) {
            log.error("Certificate PDF generation failed for badge {}", badgeId, e);
            throw new IllegalStateException("Impossible de générer le certificat PDF: " + e.getMessage());
        }
    }

    private static String safeCertificateFilename(String badgeName) {
        String base = Optional.ofNullable(badgeName).orElse("Badge").replaceAll("[^a-zA-Z0-9_-]+", "_");
        String stamp = java.time.Instant.now().toString().replace(":", "-");
        return "Certificate_" + base + "_" + stamp + ".pdf";
    }

    private void drawBackground(PDPageContentStream cs, LevelColors colors) throws IOException {
        cs.setNonStrokingColor(1f, 1f, 1f);
        cs.addRect(0, 0, PAGE_W, PAGE_H);
        cs.fill();

        float bandH = 114f;
        float bandY = PAGE_H - bandH;
        cs.setNonStrokingColor(colors.softR(), colors.softG(), colors.softB());
        cs.addRect(0, bandY, PAGE_W, bandH);
        cs.fill();

        float accentH = 6f;
        float accentY = PAGE_H - 108f - accentH;
        cs.setNonStrokingColor(colors.accentR(), colors.accentG(), colors.accentB());
        cs.addRect(0, accentY, PAGE_W, accentH);
        cs.fill();
    }

    private void drawHeader(PDPageContentStream cs, LevelColors colors) throws IOException {
        float yBrand = baselineFromTop(32f, 24f);
        cs.beginText();
        cs.setNonStrokingColor(0.06f, 0.09f, 0.16f);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 24);
        cs.newLineAtOffset(MARGIN_X, yBrand);
        cs.showText(latin1Safe(brandTitle));
        cs.endText();

        float ySub = baselineFromTop(62f, 13f);
        cs.beginText();
        cs.setNonStrokingColor(0.2f, 0.26f, 0.33f);
        cs.setFont(PDType1Font.HELVETICA, 13);
        cs.newLineAtOffset(MARGIN_X, ySub);
        cs.showText(latin1Safe(subtitle));
        cs.endText();
    }

    private void drawBody(
            PDPageContentStream cs,
            PDDocument doc,
            String badgeName,
            String badgeLevel,
            String studentName,
            String achievedPoints,
            String obtainedText,
            String qrPayload
    ) throws IOException, WriterException {
        float qrW = 130f;
        float qrH = 130f;
        float gap = 20f;
        float qrX = PAGE_W - MARGIN_X - qrW;
        float qrTop = 165f;
        float qrBottom = PAGE_H - qrTop - qrH;
        float leftW = qrX - MARGIN_X - gap;

        float y = baselineFromTop(140f, 34f);
        cs.beginText();
        cs.setNonStrokingColor(0.06f, 0.09f, 0.16f);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 34);
        cs.newLineAtOffset(MARGIN_X, y);
        cs.showText(trimForWidth(badgeName, 34, leftW));
        cs.endText();

        y = baselineFromTop(178f, 12f);
        cs.beginText();
        cs.setNonStrokingColor(0.39f, 0.45f, 0.55f);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
        cs.newLineAtOffset(MARGIN_X, y);
        cs.showText(latin1Safe("Level: " + badgeLevel));
        cs.endText();

        y = baselineFromTop(198f, 20f);
        cs.beginText();
        cs.setNonStrokingColor(0.06f, 0.09f, 0.16f);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 20);
        cs.newLineAtOffset(MARGIN_X, y);
        cs.showText(trimForWidth(studentName, 20, leftW));
        cs.endText();

        String paragraph = "This certificate confirms that " + studentName + " has earned the " + badgeName
                + " badge after reaching " + achievedPoints + " points through quiz achievements.";
        float paraTop = 248f;
        float lastBaseline = drawWrappedText(cs, latin1Safe(paragraph), MARGIN_X, paraTop, leftW, 12f, 4f);

        if (!obtainedText.isEmpty()) {
            float yDate = lastBaseline - 18f;
            cs.beginText();
            cs.setNonStrokingColor(0.39f, 0.45f, 0.55f);
            cs.setFont(PDType1Font.HELVETICA, 11);
            cs.newLineAtOffset(MARGIN_X, yDate);
            cs.showText(latin1Safe("Date of achievement: " + obtainedText));
            cs.endText();
        }

        byte[] png = renderQrPng(qrPayload, (int) qrW);
        PDImageXObject qrImg = PDImageXObject.createFromByteArray(doc, png, "qr");
        cs.setStrokingColor(0.89f, 0.91f, 0.94f);
        cs.addRect(qrX - 8f, qrBottom - 8f, qrW + 16f, qrH + 16f);
        cs.stroke();
        cs.drawImage(qrImg, qrX, qrBottom, qrW, qrH);

        String scanLabel = "Scan to verify";
        float scanFont = 9f;
        float scanWpx = PDType1Font.HELVETICA.getStringWidth(scanLabel) * scanFont / 1000f;
        float scanX = qrX + qrW / 2f - scanWpx / 2f;
        float scanY = qrBottom - 14f;
        cs.beginText();
        cs.setNonStrokingColor(0.39f, 0.45f, 0.55f);
        cs.setFont(PDType1Font.HELVETICA, scanFont);
        cs.newLineAtOffset(scanX, scanY);
        cs.showText(scanLabel);
        cs.endText();
    }

    private void drawSignaturePanel(PDPageContentStream cs) throws IOException {
        float sigY = 420f;
        float panelW = PAGE_W - 2 * MARGIN_X;
        float panelH = 120f;

        cs.setNonStrokingColor(0.97f, 0.98f, 0.99f);
        cs.addRect(MARGIN_X, sigY, panelW, panelH);
        cs.fill();
        cs.setStrokingColor(0.89f, 0.91f, 0.94f);
        cs.addRect(MARGIN_X, sigY, panelW, panelH);
        cs.stroke();

        float pad = 18f;
        cs.beginText();
        cs.setNonStrokingColor(0.06f, 0.09f, 0.16f);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
        cs.newLineAtOffset(MARGIN_X + pad, sigY + panelH - pad - 14f);
        cs.showText("Official Signature");
        cs.endText();

        float sigLineY = sigY + panelH - pad - 45f;
        cs.setStrokingColor(0.06f, 0.09f, 0.16f);
        cs.setLineWidth(1f);
        cs.moveTo(MARGIN_X + pad, sigLineY);
        cs.lineTo(MARGIN_X + panelW - pad, sigLineY);
        cs.stroke();

        cs.beginText();
        cs.setNonStrokingColor(0.06f, 0.09f, 0.16f);
        cs.setFont(PDType1Font.TIMES_ITALIC, 22);
        float cx = MARGIN_X + panelW / 2f;
        float textW = PDType1Font.TIMES_ITALIC.getStringWidth(latin1Safe(brandTitle)) * 22f / 1000f;
        cs.newLineAtOffset(cx - textW / 2f, sigY + panelH - pad - 72f);
        cs.showText(latin1Safe(brandTitle));
        cs.endText();

        cs.beginText();
        cs.setNonStrokingColor(0.2f, 0.26f, 0.33f);
        cs.setFont(PDType1Font.HELVETICA, 10);
        cs.newLineAtOffset(MARGIN_X + pad, sigY + pad);
        cs.showText(latin1Safe(footerLegend));
        cs.endText();
    }

    private static float baselineFromTop(float yFromTop, float fontSize) {
        return PAGE_H - yFromTop - fontSize * 0.85f;
    }

    /** @return ordonnée PDF (baseline) de la dernière ligne écrite */
    private float drawWrappedText(PDPageContentStream cs, String text, float x, float yTopFromPageTop, float maxWidth, float fontSize, float lineGap)
            throws IOException {
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        float y = PAGE_H - yTopFromPageTop - fontSize;
        float lastY = y;
        for (String w : words) {
            String trial = line.isEmpty() ? w : line + " " + w;
            float tw = PDType1Font.HELVETICA.getStringWidth(trial) * fontSize / 1000f;
            if (tw > maxWidth && !line.isEmpty()) {
                cs.beginText();
                cs.setNonStrokingColor(0.2f, 0.26f, 0.33f);
                cs.setFont(PDType1Font.HELVETICA, fontSize);
                cs.newLineAtOffset(x, y);
                cs.showText(line.toString());
                cs.endText();
                y -= fontSize + lineGap;
                lastY = y;
                line = new StringBuilder(w);
            } else {
                line = new StringBuilder(trial);
            }
        }
        if (!line.isEmpty()) {
            cs.beginText();
            cs.setNonStrokingColor(0.2f, 0.26f, 0.33f);
            cs.setFont(PDType1Font.HELVETICA, fontSize);
            cs.newLineAtOffset(x, y);
            cs.showText(line.toString());
            cs.endText();
            lastY = y;
        }
        return lastY;
    }

    private String trimForWidth(String text, float fontSize, float maxWidth) throws IOException {
        String s = latin1Safe(text);
        float tw = PDType1Font.HELVETICA_BOLD.getStringWidth(s) * fontSize / 1000f;
        if (tw <= maxWidth) return s;
        String ell = "...";
        while (s.length() > 3) {
            s = s.substring(0, s.length() - 1);
            tw = PDType1Font.HELVETICA_BOLD.getStringWidth(s + ell) * fontSize / 1000f;
            if (tw <= maxWidth) return s + ell;
        }
        return ell;
    }

    private byte[] renderQrPng(String text, int size) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 1);
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(text, BarcodeFormat.QR_CODE, size, size, hints);
        BufferedImage img = MatrixToImageWriter.toBufferedImage(matrix);
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        ImageIO.write(img, "PNG", png);
        return png.toByteArray();
    }

    private String resolveStudentName(Long studentId) {
        if (studentId == null) return "Student";
        Optional<Student> st = studentRepository.findById(studentId);
        if (st.isEmpty()) return "Student";
        Student s = st.get();
        String fn = Optional.ofNullable(s.getFirstName()).orElse("").trim();
        String ln = Optional.ofNullable(s.getLastName()).orElse("").trim();
        String full = (fn + " " + ln).trim();
        if (!full.isEmpty()) return full;
        String email = s.getEmail();
        if (email != null && email.contains("@")) {
            return email.substring(0, email.indexOf('@'));
        }
        return "Student";
    }

    private static String extractPointsToken(String criteriaMet) {
        if (criteriaMet == null || criteriaMet.isBlank()) return "0";
        Matcher m = DIGITS.matcher(criteriaMet);
        return m.find() ? m.group(1) : criteriaMet.trim();
    }

    private static String latin1Safe(String input) {
        if (input == null) return "";
        String n = Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
        StringBuilder out = new StringBuilder();
        for (char c : n.toCharArray()) {
            if (c >= 32 && c <= 126) {
                out.append(c);
            } else if (c == '€') {
                out.append("EUR");
            } else {
                out.append('?');
            }
        }
        return out.toString();
    }

    private static LevelColors colorsFor(Badge.BadgeLevel level) {
        if (level == null) return LevelColors.DEFAULT;
        return switch (level) {
            case BRONZE -> new LevelColors(0.71f, 0.42f, 0.17f, 0.96f, 0.92f, 0.86f);
            case SILVER -> new LevelColors(0.49f, 0.53f, 0.58f, 0.93f, 0.95f, 0.96f);
            case GOLD -> new LevelColors(0.78f, 0.54f, 0.02f, 1f, 0.95f, 0.85f);
            case PLATINUM -> new LevelColors(0.05f, 0.6f, 0.68f, 0.88f, 0.96f, 0.98f);
            case DIAMOND -> new LevelColors(0.39f, 0.4f, 0.95f, 0.93f, 0.94f, 1f);
        };
    }

    private record LevelColors(float accentR, float accentG, float accentB, float softR, float softG, float softB) {
        static final LevelColors DEFAULT = new LevelColors(0.05f, 0.62f, 0.43f, 0.91f, 0.97f, 0.95f);
    }
}
