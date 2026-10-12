package com.polytch_intel.Projet_Federateur.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DatasetCreateRequest(
        @NotBlank(message = "Le nom du dataset est obligatoire.")
        @Size(max = 200, message = "Le nom du dataset ne peut pas dépasser 200 caractères.")
        String name,
        @Min(value = 1, message = "Le dataset doit contenir au moins une ligne.")
        @Max(value = 500_000, message = "Un dataset ne peut pas dépasser 500 000 lignes.")
        int rowsCount,
        @Min(value = 1, message = "Le dataset doit contenir au moins une colonne.")
        @Max(value = 1_000, message = "Un dataset ne peut pas dépasser 1 000 colonnes.")
        int colsCount,
        @NotBlank(message = "Le contenu du dataset est obligatoire.")
        @Size(max = 20_000_000, message = "Le contenu du dataset dépasse la limite autorisée.")
        String jsonData
) {
}
