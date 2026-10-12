package com.polytch_intel.Projet_Federateur.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO pour mettre à jour un Dataset sans écraser les champs automatiquement générés (ex: uploadDate).
 * Tous les champs sont optionnels : si null, on ne modifie pas la valeur existante.
 */
@Data
public class DatasetUpdateRequest {
    @Pattern(regexp = ".*\\S.*", message = "Le nom ne peut pas être vide.")
    @Size(max = 200, message = "Le nom ne peut pas dépasser 200 caractères.")
    private String name;
    @Min(value = 1, message = "Le dataset doit contenir au moins une ligne.")
    @Max(value = 500_000, message = "Un dataset ne peut pas dépasser 500 000 lignes.")
    private Integer rowsCount;
    @Min(value = 1, message = "Le dataset doit contenir au moins une colonne.")
    @Max(value = 1_000, message = "Un dataset ne peut pas dépasser 1 000 colonnes.")
    private Integer colsCount;
    @Size(max = 20_000_000, message = "Le contenu du dataset dépasse la limite autorisée.")
    private String jsonData;
}
