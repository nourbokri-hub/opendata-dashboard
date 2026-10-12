package com.polytch_intel.Projet_Federateur.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank(message = "Le nom est obligatoire.")
        @Size(max = 100, message = "Le nom ne peut pas dépasser 100 caractères.")
        String name,
        @NotBlank(message = "L'adresse email est obligatoire.")
        @Email(message = "L'adresse email est invalide.")
        String email,
        @Pattern(regexp = "^(?:|.{8,72})$", message = "Le nouveau mot de passe doit contenir entre 8 et 72 caractères.")
        String password
) {
}
