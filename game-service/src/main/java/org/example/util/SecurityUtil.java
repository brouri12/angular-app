package org.example.util;

/**
 * Utility for extracting user information.
 * Simplified version for standalone operation without authentication.
 */
public class SecurityUtil {

    /**
     * Get current user ID.
     * Returns a default user ID for standalone operation.
     */
    public static String getCurrentUserId() {
        return "default-user";
    }

    /**
     * Check if user is authenticated.
     * Always returns true for standalone operation.
     */
    public static boolean isAuthenticated() {
        return true;
    }

    /**
     * Get claim from authentication token.
     * Returns null for standalone operation.
     */
    public static String getClaimFromToken(String claimName) {
        return null;
    }
}
