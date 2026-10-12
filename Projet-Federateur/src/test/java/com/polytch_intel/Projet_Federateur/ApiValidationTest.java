package com.polytch_intel.Projet_Federateur;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ApiValidationTest extends BaseIntegrationTest {

    @Test
    @WithMockUser(username = "admin@opendata.tn", roles = "ADMIN")
    void rejectsInvalidDatasetMetadataWithStructuredValidationError() throws Exception {
        mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": " ",
                                  "rowsCount": 0,
                                  "colsCount": 1001,
                                  "jsonData": "[]"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.fieldErrors.name").isNotEmpty())
                .andExpect(jsonPath("$.fieldErrors.rowsCount").isNotEmpty())
                .andExpect(jsonPath("$.fieldErrors.colsCount").isNotEmpty());
    }

    @Test
    @WithMockUser(username = "admin@opendata.tn", roles = "ADMIN")
    void rejectsMalformedOrNonTabularDatasetJson() throws Exception {
        mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Malformed",
                                  "rowsCount": 1,
                                  "colsCount": 1,
                                  "jsonData": "not json"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Le contenu JSON du dataset est invalide."));

        mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Not a table",
                                  "rowsCount": 1,
                                  "colsCount": 1,
                                  "jsonData": "{\\"value\\":1}"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Le contenu du dataset doit être un tableau JSON contenant au moins une ligne."
                ));
    }

    @Test
    @WithMockUser(username = "admin@opendata.tn", roles = "ADMIN")
    void acceptsFrontendDatasetDtoAndReturnsExpectedArchiveProperty() throws Exception {
        mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Imported from frontend",
                                  "rowsCount": 1,
                                  "colsCount": 1,
                                  "jsonData": "[{\\"value\\":1}]"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Imported from frontend"))
                .andExpect(jsonPath("$.rowsCount").value(1))
                .andExpect(jsonPath("$.colsCount").value(1))
                .andExpect(jsonPath("$.archived").value(false));
    }

    @Test
    void rejectsRegistrationPasswordsShorterThanEightCharacters() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"New User","email":"new-user@example.com","password":"1234567"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.password").value(
                        "Le mot de passe doit contenir entre 8 et 72 caractères."
                ));
    }
}
