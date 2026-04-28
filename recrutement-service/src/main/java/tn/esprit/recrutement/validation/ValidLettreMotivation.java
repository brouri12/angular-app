package tn.esprit.recrutement.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = LettreMotivationValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidLettreMotivation {
    String message() default "Lettre de motivation invalide";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
