package tn.esprit.recrutement.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class CvUrlValidator implements ConstraintValidator<ValidCvUrl, String> {

    // Pattern pour URL valide (incluant localhost)
    private static final Pattern URL_PATTERN = Pattern.compile(
        "^https?://(localhost(:[0-9]+)?|[a-zA-Z0-9][a-zA-Z0-9.-]*\\.[a-zA-Z]{2,})(/.*)?$"
    );

    // Extensions de fichiers acceptées pour un CV
    private static final String[] VALID_EXTENSIONS = {
        ".pdf", ".doc", ".docx", ".txt"
    };

    @Override
    public boolean isValid(String cvUrl, ConstraintValidatorContext context) {
        if (cvUrl == null || cvUrl.trim().isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "L'URL du CV est obligatoire"
            ).addConstraintViolation();
            return false;
        }

        cvUrl = cvUrl.trim();

        // Vérifier la longueur
        if (cvUrl.length() < 10 || cvUrl.length() > 500) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "L'URL du CV doit contenir entre 10 et 500 caractères"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier le format de l'URL
        if (!URL_PATTERN.matcher(cvUrl).matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "L'URL du CV doit commencer par http:// ou https:// et être valide"
            ).addConstraintViolation();
            return false;
        }

        String lowerUrl = cvUrl.toLowerCase();

        // Accepter localhost sans vérification d'extension (pour développement/test)
        if (lowerUrl.contains("localhost") || lowerUrl.contains("127.0.0.1")) {
            return true;
        }

        // Pour les autres URLs, vérifier l'extension ou le domaine de partage
        boolean hasValidExtension = false;
        for (String ext : VALID_EXTENSIONS) {
            if (lowerUrl.contains(ext)) {
                hasValidExtension = true;
                break;
            }
        }

        // Accepter les domaines de partage de fichiers même sans extension visible
        boolean isKnownFileSharing = 
            lowerUrl.contains("drive.google.com") || 
            lowerUrl.contains("dropbox.com") || 
            lowerUrl.contains("onedrive.live.com") ||
            lowerUrl.contains("box.com") ||
            lowerUrl.contains("icloud.com");

        if (!hasValidExtension && !isKnownFileSharing) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "L'URL du CV doit pointer vers un fichier PDF, DOC, DOCX ou TXT, ou provenir d'un service de partage reconnu (Google Drive, Dropbox, OneDrive, Box, iCloud)"
            ).addConstraintViolation();
            return false;
        }

        return true;
    }
}
