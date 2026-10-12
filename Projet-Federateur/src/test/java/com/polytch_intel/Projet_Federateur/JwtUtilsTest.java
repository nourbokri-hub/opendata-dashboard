package com.polytch_intel.Projet_Federateur;

import com.polytch_intel.Projet_Federateur.security.JwtUtils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtUtilsTest {

    @Test
    void rejectsMissingSecretWithActionableMessage() {
        IllegalStateException error = assertThrows(
                IllegalStateException.class,
                () -> new JwtUtils(" ", 86_400_000)
        );

        org.junit.jupiter.api.Assertions.assertTrue(error.getMessage().contains("JWT_SECRET is required"));
    }

    @Test
    void rejectsSecretTooShortForHs512() {
        IllegalStateException error = assertThrows(
                IllegalStateException.class,
                () -> new JwtUtils("short-secret", 86_400_000)
        );

        org.junit.jupiter.api.Assertions.assertTrue(error.getMessage().contains("at least 64 UTF-8 bytes"));
    }

    @Test
    void acceptsSecretWithAtLeast64Bytes() {
        assertDoesNotThrow(() -> new JwtUtils("a".repeat(64), 86_400_000));
    }
}
