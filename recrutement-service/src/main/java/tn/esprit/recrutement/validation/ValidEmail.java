package tn.esprit.recrutement.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = EmailValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmail {
    String message() default "Email invalide. Format attendu : exemple@domaine.com";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
