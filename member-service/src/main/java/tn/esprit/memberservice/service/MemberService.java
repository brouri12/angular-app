package tn.esprit.memberservice.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.memberservice.entity.BadgeLevel;
import tn.esprit.memberservice.entity.Member;
import tn.esprit.memberservice.entity.MemberRole;
import tn.esprit.memberservice.entity.MemberStatus;
import tn.esprit.memberservice.repository.MemberRepository;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import jakarta.annotation.PostConstruct;
import java.util.UUID;
import java.util.*;
import javax.imageio.ImageIO;

@Service
public class MemberService {

    private final MemberRepository repo;
    private final EmailService emailService;
    private final RestTemplate restTemplate;

    private static final String PUBLIC_BASE_URL = "http://192.168.1.17:8888";
    private static final String CLUB_SERVICE_URL = "http://localhost:8888/clubs/";

    // ── Couleurs de la carte ──
    private static final Color COLOR_DARK    = new Color(15, 23, 42);      // #0f172a
    private static final Color COLOR_ACCENT  = new Color(0, 200, 151);     // #00c897
    private static final Color COLOR_PURPLE  = new Color(99, 102, 241);    // #6366f1
    private static final Color COLOR_WHITE   = Color.WHITE;
    private static final Color COLOR_LIGHT   = new Color(241, 245, 249);   // #f1f5f9
    private static final Color COLOR_MUTED   = new Color(100, 116, 139);   // #64748b

    public MemberService(MemberRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
        this.restTemplate = new RestTemplate();
    }

    /** Génère un badgeId pour les membres existants qui n'en ont pas */
    @PostConstruct
    public void migrateBadgeIds() {
        List<Member> members = repo.findAll();
        boolean updated = false;
        for (Member m : members) {
            if (m.getBadgeId() == null || m.getBadgeId().isBlank()) {
                m.setBadgeId(UUID.randomUUID().toString());
                repo.save(m);
                updated = true;
            }
        }
        if (updated) System.out.println("✅ BadgeIds migrés pour les membres existants");
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public Member create(Member m) {
        if (m.getIdUser() == null)    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "idUser est obligatoire");
        if (m.getIdClub() == null)   throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "idClub est obligatoire");
        if (m.getNom()    == null || m.getNom().isBlank())    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "nom est obligatoire");
        if (m.getPrenom() == null || m.getPrenom().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "prenom est obligatoire");
        if (m.getEmail()  == null || m.getEmail().isBlank())  throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email est obligatoire");
        if (m.getTelephone() == null || m.getTelephone().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "telephone est obligatoire");
        if (m.getNiveauAnglais() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "niveauAnglais est obligatoire");
        if (repo.existsByIdUserAndIdClub(m.getIdUser(), m.getIdClub()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous êtes déjà inscrit dans ce club.");
        m.setRole(MemberRole.RECRUE);
        return repo.save(m);
    }

    public void delete(Long id) {
        if (id == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "id est obligatoire");
        repo.deleteById(id);
    }

    public List<Member> getAll()                    { return repo.findAll(); }
    public Member getById(Long id)                  { return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member introuvable")); }
    public List<Member> getByUser(Long idUser)      { return repo.findByIdUser(idUser); }
    public List<Member> getByClub(Long idClub)      { return repo.findByIdClub(idClub); }
    public boolean isJoined(Long idUser, Long idClub){ return repo.existsByIdUserAndIdClub(idUser, idClub); }
    public List<Member> getByStatus(MemberStatus s) { return repo.findByStatus(s); }

    public Member updateStatus(Long id, MemberStatus status) {
        Member m = getById(id);
        MemberStatus prev = m.getStatus();
        m.setStatus(status);
        Member saved = repo.save(m);
        // +30 quand accepté pour la première fois
        if (status == MemberStatus.ACCEPTED && prev != MemberStatus.ACCEPTED) {
            addScore(m.getIdUser(), m.getIdClub(), 30);
        }
        return saved;
    }
    public Member updateRole(Long id, MemberRole role) {
        if (role == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "role est obligatoire");
        Member m = getById(id);
        if (role == MemberRole.PRESIDENT) {
            // Un seul président par club
            boolean clubHasPresident = repo.existsByIdClubAndRole(m.getIdClub(), MemberRole.PRESIDENT);
            if (clubHasPresident && m.getRole() != MemberRole.PRESIDENT) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce club a déjà un président.");
            }
            // Un user ne peut être président que dans un seul club
            boolean userAlreadyPresident = repo.existsByIdUserAndRole(m.getIdUser(), MemberRole.PRESIDENT);
            if (userAlreadyPresident && m.getRole() != MemberRole.PRESIDENT) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet utilisateur est déjà président d'un autre club.");
            }
        }
        m.setRole(role);
        return repo.save(m);
    }

    // ── SCORE ─────────────────────────────────────────────────────────────────

    public Member addScore(Long idUser, Long idClub, int points) {
        Member m = repo.findByIdUserAndIdClub(idUser, idClub)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable"));
        int newScore = Math.max(0, m.getScore() + points); // score ne descend pas sous 0
        m.setScore(newScore);
        m.setBadgeLevel(computeLevel(newScore));
        return repo.save(m);
    }

    private BadgeLevel computeLevel(int score) {
        if (score > 200) return BadgeLevel.PREMIUM;
        if (score > 100) return BadgeLevel.GOLD;
        if (score > 50)  return BadgeLevel.SILVER;
        return BadgeLevel.BRONZE;
    }

    // ── VERIFY BADGE ──────────────────────────────────────────────────────────

    public Optional<Map<String, Object>> verifyBadge(String badgeId) {
        return repo.findByBadgeId(badgeId).map(m -> {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("valid",      true);
            info.put("name",       safe(m.getPrenom()) + " " + safe(m.getNom()));
            info.put("club",       getClubName(m.getIdClub()));
            info.put("role",       m.getRole() == MemberRole.PRESIDENT ? "Président" : "Recrue");
            info.put("level",      m.getNiveauAnglais() != null ? m.getNiveauAnglais().name() : "—");
            info.put("joinDate",   formatDate(m.getDateJoin()));
            info.put("score",      m.getScore());
            info.put("badgeLevel", m.getBadgeLevel() != null ? m.getBadgeLevel().name() : "BRONZE");
            info.put("badgeId",    badgeId);
            return info;
        });
    }

    // ── SEND BADGE EMAIL ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public void sendBadgeEmail(Long idUser, Long idClub) {
        Member m = repo.findByIdUserAndIdClub(idUser, idClub)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vous n'êtes pas inscrit dans ce club."));

        // URL de vérification publique (scannée par le QR)
        String verifyUrl = PUBLIC_BASE_URL + "/membres/verify/" + m.getBadgeId();
        byte[] qrPng = generateQrPng(verifyUrl);

        String subject = "🎖️ Votre Badge Officiel — " + getClubName(m.getIdClub());
        String html    = buildEmailHtml(m, verifyUrl);

        try {
            emailService.sendHtmlWithInlineQr(m.getEmail(), subject, html, qrPng);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur envoi email: " + e.getMessage());
        }
        // +10 pour avoir obtenu son badge
        addScore(idUser, idClub, 10);
    }

    // ── GENERATE PDF (PDFBox — style carte ID) ────────────────────────────────

    @Transactional(readOnly = true)
    public byte[] generateBadgePdf(Long idUser, Long idClub) {
        Member m = repo.findByIdUserAndIdClub(idUser, idClub)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member introuvable"));
        try {
            return buildPdf(m);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur génération PDF: " + e.getMessage());
        }
    }

    // ── PDF BUILDER ───────────────────────────────────────────────────────────

    private byte[] buildPdf(Member m) throws Exception {

        String fullName  = (safe(m.getPrenom()) + " " + safe(m.getNom())).trim();
        String clubName  = getClubName(m.getIdClub());
        String roleLabel = m.getRole() == MemberRole.PRESIDENT ? "PRÉSIDENT" : "RECRUE";
        String niveau    = m.getNiveauAnglais() != null ? m.getNiveauAnglais().name() : "—";
        String joinDate  = formatDate(m.getDateJoin());
        String badgeId   = m.getBadgeId() != null ? m.getBadgeId().substring(0, 8).toUpperCase() : "N/A";
        String verifyUrl = PUBLIC_BASE_URL + "/membres/verify/" + m.getBadgeId();
        String levelStr  = m.getBadgeLevel() != null ? m.getBadgeLevel().name() : "BRONZE";
        int    score     = m.getScore();

        // ── Dimensions carte bancaire (85.6 × 54 mm en points PDF) ──
        float W = 242f;  // 85.6mm
        float H = 153f;  // 54mm

        PDDocument doc = new PDDocument();
        PDPage page = new PDPage(new PDRectangle(W, H));
        doc.addPage(page);

        PDPageContentStream cs = new PDPageContentStream(doc, page);

        // ── Fond sombre ──
        fillRect(cs, COLOR_DARK, 0, 0, W, H);

        // ── Bande décorative gauche (accent) ──
        fillRect(cs, COLOR_ACCENT, 0, 0, 6, H);

        // ── Cercle décoratif haut-droite ──
        drawCircle(cs, new Color(255, 255, 255, 15), W - 30, H - 10, 55);
        drawCircle(cs, new Color(255, 255, 255, 8),  W - 10, H + 10, 75);

        // ── Bande titre en haut ──
        fillRect(cs, new Color(30, 41, 59), 6, H - 28, W - 6, 28);

        // ── Titre "JUNGLE IN ENGLISH" ──
        PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font fontReg  = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        drawText(cs, fontBold, 7f, "JUNGLE IN ENGLISH", 14, H - 18, COLOR_ACCENT);
        drawText(cs, fontReg,  6f, "OFFICIAL MEMBER BADGE", 14, H - 26, new Color(148, 163, 184));

        // ── Nom complet ──
        drawText(cs, fontBold, 11f, fullName.toUpperCase(), 14, H - 50, COLOR_WHITE);

        // ── Club ──
        drawText(cs, fontReg, 7f, clubName, 14, H - 62, COLOR_ACCENT);

        // ── Séparateur ──
        fillRect(cs, new Color(51, 65, 85), 14, H - 68, W - 28, 0.5f);

        // ── Infos (niveau, date, rôle) ──
        drawLabel(cs, fontBold, fontReg, "NIVEAU",       niveau,   14,  H - 82);
        drawLabel(cs, fontBold, fontReg, "MEMBRE DEPUIS", joinDate, 14,  H - 98);
        drawLabel(cs, fontBold, fontReg, "RÔLE",         roleLabel, 14, H - 114);

        // ── Badge ID ──
        drawText(cs, fontReg, 5.5f, "ID: " + badgeId, 14, 10, new Color(100, 116, 139));

        // ── Pill rôle (couleur selon rôle) ──
        Color pillColor = m.getRole() == MemberRole.PRESIDENT ? COLOR_PURPLE : COLOR_ACCENT;
        fillRoundRect(cs, pillColor, W - 68, H - 50, 54, 14, 4);
        drawText(cs, fontBold, 6f, roleLabel, W - 65, H - 44, COLOR_WHITE);

        // ── Pill niveau (BRONZE/SILVER/GOLD/PREMIUM) ──
        Color levelColor = switch (levelStr) {
            case "SILVER"  -> new Color(148, 163, 184);
            case "GOLD"    -> new Color(245, 158, 11);
            case "PREMIUM" -> new Color(139, 92, 246);
            default        -> new Color(180, 120, 60); // BRONZE
        };
        fillRoundRect(cs, levelColor, W - 68, H - 68, 54, 14, 4);
        drawText(cs, fontBold, 6f, levelStr, W - 65, H - 62, COLOR_WHITE);

        // ── Score ──
        drawText(cs, fontBold, 6f, "SCORE: " + score, 14, 10 + 12, new Color(0, 200, 151));

        // ── QR Code ──
        byte[] qrBytes = generateQrPng(verifyUrl);
        PDImageXObject qrImg = PDImageXObject.createFromByteArray(doc, qrBytes, "qr");
        cs.drawImage(qrImg, W - 52, 18, 38, 38);
        drawText(cs, fontReg, 4.5f, "SCANNER", W - 46, 14, new Color(100, 116, 139));

        cs.close();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        doc.save(out);
        doc.close();
        return out.toByteArray();
    }

    // ── DRAWING HELPERS ───────────────────────────────────────────────────────

    private void fillRect(PDPageContentStream cs, Color c, float x, float y, float w, float h) throws Exception {
        cs.setNonStrokingColor(c);
        cs.addRect(x, y, w, h);
        cs.fill();
    }

    private void fillRoundRect(PDPageContentStream cs, Color c, float x, float y, float w, float h, float r) throws Exception {
        // PDFBox 3 n'a pas de roundRect natif — on fait un rect simple avec coins simulés
        fillRect(cs, c, x + r, y, w - 2 * r, h);
        fillRect(cs, c, x, y + r, w, h - 2 * r);
    }

    private void drawCircle(PDPageContentStream cs, Color c, float cx, float cy, float r) throws Exception {
        cs.setNonStrokingColor(c);
        float k = 0.5523f;
        cs.moveTo(cx - r, cy);
        cs.curveTo(cx - r, cy + k * r, cx - k * r, cy + r, cx, cy + r);
        cs.curveTo(cx + k * r, cy + r, cx + r, cy + k * r, cx + r, cy);
        cs.curveTo(cx + r, cy - k * r, cx + k * r, cy - r, cx, cy - r);
        cs.curveTo(cx - k * r, cy - r, cx - r, cy - k * r, cx - r, cy);
        cs.fill();
    }

    private void drawText(PDPageContentStream cs, PDType1Font font, float size,
                          String text, float x, float y, Color c) throws Exception {
        cs.beginText();
        cs.setNonStrokingColor(c);
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(sanitize(text));
        cs.endText();
    }

    private void drawLabel(PDPageContentStream cs, PDType1Font bold, PDType1Font reg,
                           String label, String value, float x, float y) throws Exception {
        drawText(cs, bold, 5.5f, label, x, y,      new Color(100, 116, 139));
        drawText(cs, reg,  7.5f, value, x, y - 10, COLOR_WHITE);
    }

    /** Supprime les caractères non-WinAnsi pour PDFBox */
    private String sanitize(String s) {
        if (s == null) return "";
        return s.chars()
            .filter(c -> c < 256)
            .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
            .toString();
    }

    // ── QR GENERATOR ─────────────────────────────────────────────────────────

    private byte[] generateQrPng(String text) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(text, BarcodeFormat.QR_CODE, 300, 300);

            // QR blanc sur fond transparent pour s'intégrer sur fond sombre
            BufferedImage img = new BufferedImage(300, 300, BufferedImage.TYPE_INT_ARGB);
            for (int x = 0; x < 300; x++) {
                for (int y = 0; y < 300; y++) {
                    img.setRGB(x, y, matrix.get(x, y)
                        ? new Color(15, 23, 42).getRGB()
                        : Color.WHITE.getRGB());
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(img, "PNG", out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur QR: " + e.getMessage());
        }
    }

    // ── EMAIL HTML ────────────────────────────────────────────────────────────

    private String buildEmailHtml(Member m, String verifyUrl) {
        String fullName = (safe(m.getPrenom()) + " " + safe(m.getNom())).trim();
        String clubName = getClubName(m.getIdClub());
        String niveau   = m.getNiveauAnglais() != null ? m.getNiveauAnglais().name() : "Non spécifié";
        String role     = m.getRole() == MemberRole.PRESIDENT ? "Président" : "Recrue";
        String joinDate = formatDate(m.getDateJoin());
        String badgeId  = m.getBadgeId() != null ? m.getBadgeId().substring(0, 8).toUpperCase() : "N/A";
        String levelStr = m.getBadgeLevel() != null ? m.getBadgeLevel().name() : "BRONZE";
        int    score    = m.getScore();

        String levelColor = switch (levelStr) {
            case "SILVER"  -> "#94a3b8";
            case "GOLD"    -> "#f59e0b";
            case "PREMIUM" -> "#8b5cf6";
            default        -> "#b47c3c";
        };
        String levelEmoji = switch (levelStr) {
            case "SILVER"  -> "🥈";
            case "GOLD"    -> "🥇";
            case "PREMIUM" -> "💎";
            default        -> "🥉";
        };

        return
            "<div style='margin:0;padding:0;background:#f0f4f8;font-family:Inter,Segoe UI,Arial,sans-serif'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='max-width:600px;margin:0 auto;padding:32px 16px'>" +
            "<tr><td>" +

            // Header
            "<div style='background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:20px 20px 0 0;padding:36px 32px 28px;text-align:center;position:relative;overflow:hidden'>" +
            "<div style='position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;background:rgba(0,200,151,0.12)'></div>" +
            "<div style='font-size:44px;margin-bottom:10px'>🎖️</div>" +
            "<h1 style='margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em'>Badge Officiel</h1>" +
            "<p style='margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:0.1em;text-transform:uppercase'>jungle in english — Club Membership</p>" +
            "</div>" +

            // Badge ID strip
            "<div style='background:#00c897;padding:8px 28px;display:flex;justify-content:space-between;align-items:center'>" +
            "<span style='color:#fff;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase'>Badge ID</span>" +
            "<span style='color:#fff;font-size:13px;font-weight:900;letter-spacing:0.15em'>#" + escape(badgeId) + "</span>" +
            "</div>" +

            // Member card
            "<div style='background:#fff;padding:28px'>" +
            "<div style='display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #f1f5f9'>" +
            "<div style='width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#00c897,#6366f1);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;box-shadow:0 8px 24px rgba(0,200,151,0.3)'>👤</div>" +
            "<div>" +
            "<p style='margin:0;font-size:19px;font-weight:900;color:#0f172a;letter-spacing:-0.01em'>" + escape(fullName) + "</p>" +
            "<p style='margin:4px 0 0;font-size:13px;color:#00c897;font-weight:700'>" + escape(clubName) + "</p>" +
            "</div></div>" +

            infoRow("🏆", "Rôle",          role,     m.getRole() == MemberRole.PRESIDENT ? "#6366f1" : "#00c897") +
            infoRow("📚", "Niveau",         niveau,   "#f59e0b") +
            infoRow("📅", "Membre depuis",  joinDate, "#06b6d4") +
            infoRow(levelEmoji, "Badge Level", levelStr + " — " + score + " pts", levelColor) +

            "</div>" +

            // QR section
            "<div style='background:#f8fafc;border-top:2px solid #e2e8f0;padding:28px;text-align:center'>" +
            "<p style='margin:0 0 6px;font-size:13px;font-weight:800;color:#0f172a'>Vérifiez l'authenticité de ce badge</p>" +
            "<p style='margin:0 0 18px;font-size:12px;color:#64748b'>Scannez le QR ou cliquez sur le lien</p>" +
            "<div style='display:inline-block;padding:12px;background:#fff;border-radius:16px;border:2px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,0,0,0.06)'>" +
            "<img src='cid:qr' style='width:160px;height:160px;display:block'/>" +
            "</div>" +
            "<p style='margin:16px 0 0;font-size:11px;color:#94a3b8'>Ou vérifiez directement : " +
            "<a href='" + escape(verifyUrl) + "' style='color:#6366f1;font-weight:700;text-decoration:none'>Vérifier le badge →</a></p>" +
            "</div>" +

            // Footer
            "<div style='background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:0 0 20px 20px;padding:20px 28px;text-align:center'>" +
            "<p style='margin:0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:700'>jungle in english</p>" +
            "<p style='margin:4px 0 0;color:rgba(255,255,255,0.4);font-size:11px'>Ce badge est officiel et vérifiable en ligne.</p>" +
            "</div>" +

            "</td></tr></table></div>";
    }

    private String infoRow(String icon, String label, String value, String color) {
        return
            "<div style='display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid #f8fafc'>" +
            "<div style='width:38px;height:38px;border-radius:12px;background:" + color + "18;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0'>" + icon + "</div>" +
            "<div style='flex:1'>" +
            "<p style='margin:0;font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8'>" + escape(label) + "</p>" +
            "<p style='margin:3px 0 0;font-size:14px;font-weight:800;color:#0f172a'>" + escape(value) + "</p>" +
            "</div></div>";
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private String getClubName(Long idClub) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> club = restTemplate.getForObject(CLUB_SERVICE_URL + idClub, Map.class);
            if (club != null) {
                Object nom = club.get("nomClub");
                if (nom != null && !nom.toString().isBlank()) return nom.toString();
            }
        } catch (Exception e) {
            System.out.println("Erreur récupération club: " + e.getMessage());
        }
        return "Club #" + idClub;
    }

    private String formatDate(Date d) {
        if (d == null) return "Non spécifié";
        return new SimpleDateFormat("dd MMM yyyy", Locale.FRENCH).format(d);
    }

    private String safe(String s)   { return s == null ? "" : s; }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
