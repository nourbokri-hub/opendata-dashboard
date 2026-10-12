package com.polytch_intel.Projet_Federateur;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class DatasetCrudTest extends BaseIntegrationTest {

    @Test
    @WithMockUser(username = "admin@opendata.tn", roles = "ADMIN")
    void upload_then_getActive_shouldReturnDataset() throws Exception {
        String datasetJson = """
        {
          "name": "Test Dataset",
          "uploadDate": "2026-02-04",
          "rowsCount": 10,
          "colsCount": 3,
          "jsonData": "[{\\"a\\":1},{\\"a\\":2}]",
          "archived": false
        }
        """;

        mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(datasetJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Test Dataset"));

        mockMvc.perform(get("/api/datasets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Dataset"));
    }

    @Test
    @WithMockUser(username = "admin@opendata.tn", roles = "ADMIN")
    void update_shouldChangeName() throws Exception {
        String datasetJson = """
        {
          "name": "Dataset Before",
          "uploadDate": "2026-02-04",
          "rowsCount": 10,
          "colsCount": 3,
          "jsonData": "[{\\"a\\":1}]",
          "archived": false
        }
        """;

        String created = mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(datasetJson))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // extraire l'id (simple parsing)
        int idIndex = created.indexOf("\"id\"");
        int firstQuote = created.indexOf("\"", created.indexOf(":", idIndex) + 1);
        int secondQuote = created.indexOf("\"", firstQuote + 1);
        String id = created.substring(firstQuote + 1, secondQuote);

        String updateJson = """
        { "name": "Dataset After" }
        """;

        mockMvc.perform(put("/api/datasets/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dataset After"));
    }

    @WithMockUser(username = "admin@opendata.tn", roles = "ADMIN")
    @Test
    void archiveAndRestore_shouldMoveDatasetBetweenLists() throws Exception {
        String datasetJson = """
        {
          "name": "Archive Test",
          "rowsCount": 1,
          "colsCount": 1,
          "jsonData": "[{\\"value\\":1}]"
        }
        """;
        String created = mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(datasetJson))
                .andReturn().getResponse().getContentAsString();
        String id = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(created).get("id").asText();

        mockMvc.perform(put("/api/datasets/" + id + "/archive"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/datasets/archives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Archive Test"));

        mockMvc.perform(put("/api/datasets/" + id + "/unarchive"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/datasets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Archive Test"));
    }
}
