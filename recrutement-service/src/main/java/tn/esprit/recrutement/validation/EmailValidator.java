package tn.esprit.recrutement.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class EmailValidator implements ConstraintValidator<ValidEmail, String> {

    // Pattern strict pour email professionnel/académique
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\\.[a-zA-Z]{2,}$"
    );

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        email = email.trim().toLowerCase();

        // Vérifications de base
        if (email.length() < 5 || email.length() > 100) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "L'email doit contenir entre 5 et 100 caractères"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier le format
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Format d'email invalide. Exemple valide : nom.prenom@domaine.com"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il n'y a pas de caractères consécutifs invalides
        if (email.contains("..") || email.contains("--") || email.contains("__")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "L'email ne peut pas contenir de caractères spéciaux consécutifs"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier que le domaine est valide
        String[] parts = email.split("@");
        if (parts.length != 2) {
            return false;
        }

        String domain = parts[1];
        if (domain.startsWith(".") || domain.endsWith(".") || 
            domain.startsWith("-") || domain.endsWith("-")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le domaine de l'email est invalide"
            ).addConstraintViolation();
            return false;
        }

        return true;
    }
}
