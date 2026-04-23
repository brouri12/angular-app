package tn.esprit.recrutement.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class LettreMotivationValidator implements ConstraintValidator<ValidLettreMotivation, String> {

    @Override
    public boolean isValid(String lettre, ConstraintValidatorContext context) {
        if (lettre == null || lettre.trim().isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation est obligatoire"
            ).addConstraintViolation();
            return false;
        }

        lettre = lettre.trim();

        // Vérifier la longueur minimale
        if (lettre.length() < 100) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation doit contenir au moins 100 caractères (actuellement : " + lettre.length() + ")"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier la longueur maximale
        if (lettre.length() > 2000) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation ne peut pas dépasser 2000 caractères (actuellement : " + lettre.length() + ")"
            ).addConstraintViolation();
            return false;
        }

        // Compter les mots
        String[] words = lettre.split("\\s+");
        if (words.length < 20) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation doit contenir au moins 20 mots (actuellement : " + words.length + " mots)"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il y a au moins une phrase complète (point, point d'exclamation ou point d'interrogation)
        if (!lettre.matches(".*[.!?].*")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation doit contenir au moins une phrase complète (terminée par . ! ou ?)"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il n'y a pas que des majuscules (spam)
        long upperCaseCount = lettre.chars().filter(Character::isUpperCase).count();
        long letterCount = lettre.chars().filter(Character::isLetter).count();
        
        if (letterCount > 0 && (double) upperCaseCount / letterCount > 0.7) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation contient trop de majuscules. Veuillez utiliser une casse normale"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il n'y a pas de répétitions excessives de caractères
        if (lettre.matches(".*(.)\\1{4,}.*")) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation contient des répétitions excessives de caractères"
            ).addConstraintViolation();
            return false;
        }

        // Vérifier qu'il y a un minimum de diversité de mots (pas juste "test test test...")
        long uniqueWords = java.util.Arrays.stream(words)
            .map(String::toLowerCase)
            .distinct()
            .count();
        
        if (words.length > 10 && (double) uniqueWords / words.length < 0.2) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                "La lettre de motivation doit contenir plus de diversité dans le vocabulaire (au moins 20% de mots uniques)"
            ).addConstraintViolation();
            return false;
        }

        return true;
    }
}
