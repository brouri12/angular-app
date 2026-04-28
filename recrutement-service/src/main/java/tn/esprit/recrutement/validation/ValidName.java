package tn.esprit.recrutement.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = NameValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidName {
    String message() default "Nom invalide";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
