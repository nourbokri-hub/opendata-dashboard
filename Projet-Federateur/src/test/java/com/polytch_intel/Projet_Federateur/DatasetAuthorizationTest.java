package com.polytch_intel.Projet_Federateur;

import com.polytch_intel.Projet_Federateur.entity.Dataset;
import com.polytch_intel.Projet_Federateur.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DatasetAuthorizationTest extends BaseIntegrationTest {

    private User createUser(String email, String role) {
        User user = new User();
        user.setEmail(email);
        user.setName(email);
        user.setPassword(passwordEncoder.encode("Test@123"));
        user.setRole(role);
        return userRepository.save(user);
    }

    private Dataset createDataset(String name, String ownerId, boolean archived) {
        Dataset dataset = new Dataset();
        dataset.setName(name);
        dataset.setRowsCount(1);
        dataset.setColsCount(1);
        dataset.setJsonData("[{\"value\":1}]");
        dataset.setOwnerId(ownerId);
        dataset.setArchived(archived);
        return datasetRepository.save(dataset);
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void userOnlyListsOwnedDatasetsAndCannotAccessOtherOrOwnerlessDatasets() throws Exception {
        User alice = createUser("alice@example.com", "USER");
        User bob = createUser("bob@example.com", "USER");
        Dataset aliceActive = createDataset("Alice active", alice.getId(), false);
        createDataset("Bob active", bob.getId(), false);
        createDataset("Ownerless active", null, false);
        Dataset aliceArchived = createDataset("Alice archived", alice.getId(), true);
        createDataset("Bob archived", bob.getId(), true);
        createDataset("Ownerless archived", null, true);

        mockMvc.perform(get("/api/datasets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(aliceActive.getId()));

        mockMvc.perform(get("/api/datasets/archives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(aliceArchived.getId()));
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void userCannotModifyArchiveRestoreOrDeleteAnotherUsersDataset() throws Exception {
        User alice = createUser("alice@example.com", "USER");
        User bob = createUser("bob@example.com", "USER");
        Dataset bobsActive = createDataset("Bob active", bob.getId(), false);
        Dataset bobsArchived = createDataset("Bob archived", bob.getId(), true);
        Dataset ownerlessActive = createDataset("Legacy active", null, false);
        Dataset ownerlessArchived = createDataset("Legacy archived", null, true);

        mockMvc.perform(put("/api/datasets/" + bobsActive.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Hijacked\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/api/datasets/" + bobsActive.getId() + "/archive"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Dataset introuvable ou accès non autorisé."));
        mockMvc.perform(put("/api/datasets/" + bobsArchived.getId() + "/unarchive"))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/datasets/" + bobsActive.getId()))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/api/datasets/" + ownerlessActive.getId() + "/archive"))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/api/datasets/" + ownerlessArchived.getId() + "/unarchive"))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/datasets/" + ownerlessActive.getId()))
                .andExpect(status().isNotFound());

        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(bobsActive.getId()))
                .get()
                .extracting(Dataset::getName)
                .isEqualTo("Bob active");
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(bobsActive.getId()).orElseThrow().getOwnerId())
                .isEqualTo(bob.getId());
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(bobsArchived.getId()).orElseThrow().isArchived())
                .isTrue();
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(ownerlessActive.getId())).isPresent();
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(ownerlessArchived.getId())).isPresent();
        org.assertj.core.api.Assertions.assertThat(alice.getId()).isNotEqualTo(bob.getId());
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void userCanUpdateArchiveRestoreAndDeleteTheirOwnDatasets() throws Exception {
        User alice = createUser("alice@example.com", "USER");
        Dataset active = createDataset("Alice active", alice.getId(), false);
        Dataset archived = createDataset("Alice archived", alice.getId(), true);

        mockMvc.perform(put("/api/datasets/" + active.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated by owner\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated by owner"));
        mockMvc.perform(put("/api/datasets/" + active.getId() + "/archive"))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/datasets/" + archived.getId() + "/unarchive"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/datasets/" + active.getId()))
                .andExpect(status().isOk());

        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(active.getId())).isEmpty();
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(archived.getId()).orElseThrow().isArchived())
                .isFalse();
    }

    @Test
    @WithMockUser(username = "admin@opendata.tn", roles = "ADMIN")
    void adminCanListAndManageDatasetsOwnedByOtherUsersAndOwnerlessDatasets() throws Exception {
        User bob = createUser("bob@example.com", "USER");
        Dataset bobsActive = createDataset("Bob active", bob.getId(), false);
        Dataset bobsArchived = createDataset("Bob archived", bob.getId(), true);
        Dataset ownerless = createDataset("Legacy ownerless", null, false);

        mockMvc.perform(get("/api/datasets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].ownerId").isNotEmpty());
        mockMvc.perform(get("/api/datasets/archives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(bobsArchived.getId()));

        mockMvc.perform(put("/api/datasets/" + bobsActive.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated by admin\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated by admin"));
        mockMvc.perform(put("/api/admin/datasets/" + ownerless.getId() + "/archive"))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/admin/datasets/" + ownerless.getId() + "/unarchive"))
                .andExpect(status().isNoContent());
        mockMvc.perform(put("/api/admin/datasets/" + bobsArchived.getId() + "/unarchive"))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/admin/datasets/" + bobsActive.getId()))
                .andExpect(status().isNoContent());

        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(bobsActive.getId())).isEmpty();
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(ownerless.getId()).orElseThrow().isArchived())
                .isFalse();
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(bobsArchived.getId()).orElseThrow().isArchived())
                .isFalse();
    }

    @Test
    @WithMockUser(username = "alice@example.com")
    void uploadIgnoresClientProvidedIdAndOwnerAndAssignsAuthenticatedUser() throws Exception {
        User alice = createUser("alice@example.com", "USER");
        User bob = createUser("bob@example.com", "USER");

        String response = mockMvc.perform(post("/api/datasets/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": "client-chosen-id",
                                  "name": "Alice dataset",
                                  "rowsCount": 1,
                                  "colsCount": 1,
                                  "jsonData": "[{\\"value\\":1}]",
                                  "ownerId": "%s"
                                }
                                """.formatted(bob.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not("client-chosen-id")))
                .andExpect(jsonPath("$.ownerId").value(alice.getId()))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String savedId = new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(response).get("id").asText();
        org.assertj.core.api.Assertions.assertThat(savedId).isNotEqualTo("client-chosen-id");
        org.assertj.core.api.Assertions.assertThat(datasetRepository.findById(savedId).orElseThrow().getOwnerId())
                .isEqualTo(alice.getId());
    }
}
