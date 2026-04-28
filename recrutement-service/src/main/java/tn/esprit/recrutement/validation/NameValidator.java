package tn.esprit.recrutement.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class NameValidator implements ConstraintValidator<ValidName, String> {

    // Pattern pour nom/prénom : lettres, espaces, tirets, apostrophes, accents
    private static final Pattern NAME_PATTERN = Pattern.compile(
        "^[A-ZÀ-ÿ][a-zA-ZÀ-ÿ\\s'-]*[a-zA-ZÀ-ÿ]$"
    );

    @Override
    public boolean isValid(String name, ConstraintValidatorContext context) {
        if (name == null || name.trim().isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le nom/prénom est obligatoire"
            ).addConstraintViolation();
            return false;
        }

        name = name.trim();

        // Vérifier la longueur
        if (name.length() < 2) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le nom/prénom doit contenir au moins 2 caractères"
            ).addConstraintViolation();
            return false;
        }

        if (name.length() > 50) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le nom/prénom ne peut pas dépasser 50 caractères"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier le format
        if (!NAME_PATTERN.matcher(name).matches()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le nom/prénom ne doit contenir que des lettres, espaces, tirets ou apostrophes. Il doit commencer par une majuscule"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il n'y a pas de chiffres
        if (name.matches(".*\\d.*")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le nom/prénom ne peut pas contenir de chiffres"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il n'y a pas de caractères spéciaux consécutifs
        if (name.contains("--") || name.contains("''") || name.contains("  ")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le nom/prénom ne peut pas contenir de caractères spéciaux consécutifs"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il ne commence/finit pas par un espace ou caractère spécial
        if (name.startsWith(" ") || name.endsWith(" ") || 
            name.startsWith("-") || name.endsWith("-") ||
            name.startsWith("'") || name.endsWith("'")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "Le nom/prénom ne peut pas commencer ou finir par un espace ou caractère spécial"
            ).addConstraintViolation();
            return false;
        }

        return true;
    }
}
