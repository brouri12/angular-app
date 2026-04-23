package tn.esprit.forum.exception;

/**
 * Exception thrown when file validation fails (invalid format, size, etc.)
 */
public class FileValidationException extends RuntimeException {
    
    public FileValidationException(String message) {
        super(message);
    }
    
    public FileValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
