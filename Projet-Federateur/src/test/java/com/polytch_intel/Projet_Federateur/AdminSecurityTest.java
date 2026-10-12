package com.polytch_intel.Projet_Federateur;

import com.polytch_intel.Projet_Federateur.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class AdminSecurityTest extends BaseIntegrationTest {

    private String loginAndGetToken(String email, String password) throws Exception {
        String body = """
            {"email":"%s","password":"%s"}
        """.formatted(email, password);

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andReturn().getResponse().getContentAsString();

        // La réponse est: {"token":"...", "user":{...}}
        int tokenIndex = response.indexOf("\"token\"");
        assertThat(tokenIndex).isGreaterThan(0);

        int firstQuote = response.indexOf("\"", response.indexOf(":", tokenIndex) + 1);
        int secondQuote = response.indexOf("\"", firstQuote + 1);
        return response.substring(firstQuote + 1, secondQuote);
    }

    @Test
    void adminStats_shouldRequireAuthentication_withoutToken() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void datasets_shouldRequireAuthentication_withoutToken() throws Exception {
        mockMvc.perform(get("/api/datasets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void profile_shouldRequireAuthentication_withoutToken() throws Exception {
        mockMvc.perform(put("/api/auth/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Intrus\",\"email\":\"intrus@example.com\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void datasets_shouldRequireAuthentication_withInvalidToken() throws Exception {
        mockMvc.perform(get("/api/datasets")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void profileUpdate_shouldRequireTokenAndIssueTokenForUpdatedEmail() throws Exception {
        User user = new User();
        user.setName("User Test");
        user.setEmail("profile@test.com");
        user.setPassword(passwordEncoder.encode("User@123"));
        user.setRole("USER");
        userRepository.save(user);

        String oldToken = loginAndGetToken("profile@test.com", "User@123");
        String updatedResponse = mockMvc.perform(put("/api/auth/profile")
                        .header("Authorization", "Bearer " + oldToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated\",\"email\":\"updated@test.com\",\"password\":\"\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("updated@test.com"))
                .andExpect(jsonPath("$.user.password").doesNotExist())
                .andReturn().getResponse().getContentAsString();

        String newToken = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(updatedResponse).get("token").asText();
        mockMvc.perform(get("/api/datasets")
                        .header("Authorization", "Bearer " + oldToken))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/datasets")
                        .header("Authorization", "Bearer " + newToken))
                .andExpect(status().isOk());
    }

    @Test
    void adminStats_shouldBeForbidden_forNormalUser() throws Exception {
        // créer un user normal
        User user = new User();
        user.setName("User Test");
        user.setEmail("user@test.com");
        user.setPassword(passwordEncoder.encode("User@123"));
        user.setRole("USER");
        userRepository.save(user);

        String token = loginAndGetToken("user@test.com", "User@123");

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void forbiddenAdminResponseUsesStructuredErrorWithoutLeakingDetails() throws Exception {
        User user = new User();
        user.setName("User Test");
        user.setEmail("forbidden@test.com");
        user.setPassword(passwordEncoder.encode("User@123"));
        user.setRole("USER");
        userRepository.save(user);
        String token = loginAndGetToken("forbidden@test.com", "User@123");

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void adminStats_shouldWork_forAdmin() throws Exception {
        String token = loginAndGetToken(ADMIN_EMAIL, ADMIN_PASSWORD);

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usersCount").exists())
                .andExpect(jsonPath("$.datasetsCount").exists())
                .andExpect(jsonPath("$.archivedDatasetsCount").exists());
    }
}
