package com.polytch_intel.Projet_Federateur.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.polytch_intel.Projet_Federateur.entity.Dataset;
import com.polytch_intel.Projet_Federateur.entity.User;
import com.polytch_intel.Projet_Federateur.dto.DatasetCreateRequest;
import com.polytch_intel.Projet_Federateur.dto.DatasetUpdateRequest;
import com.polytch_intel.Projet_Federateur.repository.DatasetRepository;
import com.polytch_intel.Projet_Federateur.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class DatasetService {

    private final DatasetRepository datasetRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public DatasetService(DatasetRepository datasetRepository, UserRepository userRepository,
                          ObjectMapper objectMapper) {
        this.datasetRepository = datasetRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    public List<Dataset> getActive(Authentication authentication) {
        if (isAdmin(authentication)) {
            return datasetRepository.findByIsArchivedFalseOrderByUploadDateDesc();
        }
        return datasetRepository.findByOwnerIdAndIsArchivedFalseOrderByUploadDateDesc(
                getAuthenticatedUser(authentication).getId()
        );
    }

    public List<Dataset> getArchives(Authentication authentication) {
        if (isAdmin(authentication)) {
            return datasetRepository.findByIsArchivedTrueOrderByUploadDateDesc();
        }
        return datasetRepository.findByOwnerIdAndIsArchivedTrueOrderByUploadDateDesc(
                getAuthenticatedUser(authentication).getId()
        );
    }

    public Dataset save(DatasetCreateRequest request, Authentication authentication) {
        User owner = getAuthenticatedUser(authentication);
        validateRowsJson(request.jsonData());
        Dataset dataset = new Dataset();
        dataset.setName(request.name().trim());
        dataset.setRowsCount(request.rowsCount());
        dataset.setColsCount(request.colsCount());
        dataset.setJsonData(request.jsonData());
        dataset.setUploadDate(new SimpleDateFormat("dd/MM/yyyy").format(new Date()));
        dataset.setOwnerId(owner.getId());
        return datasetRepository.save(dataset);
    }

    public void unarchive(String id, Authentication authentication) {
        Dataset dataset = requireAccessibleDataset(id, authentication);
        dataset.setArchived(false);
        datasetRepository.save(dataset);
    }

    public Dataset update(String id, DatasetUpdateRequest req, Authentication authentication) {
        Dataset ds = requireAccessibleDataset(id, authentication);

        if (req.getName() != null) ds.setName(req.getName().trim());
        if (req.getRowsCount() != null) ds.setRowsCount(req.getRowsCount());
        if (req.getColsCount() != null) ds.setColsCount(req.getColsCount());
        if (req.getJsonData() != null) {
            validateRowsJson(req.getJsonData());
            ds.setJsonData(req.getJsonData());
        }

        return datasetRepository.save(ds);
    }

    public void toggleArchive(String id, Authentication authentication) {
        Dataset ds = requireAccessibleDataset(id, authentication);
        ds.setArchived(!ds.isArchived());
        datasetRepository.save(ds);
    }

    public void delete(String id, Authentication authentication) {
        datasetRepository.delete(requireAccessibleDataset(id, authentication));
    }

    private Dataset requireAccessibleDataset(String id, Authentication authentication) {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Dataset introuvable ou accès non autorisé."
                ));
        if (isAdmin(authentication)) {
            return dataset;
        }

        String ownerId = getAuthenticatedUser(authentication).getId();
        if (ownerId == null || !ownerId.equals(dataset.getOwnerId())) {
            // Do not reveal whether another user's or an ownerless dataset exists.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dataset introuvable ou accès non autorisé.");
        }
        return dataset;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private void validateRowsJson(String jsonData) {
        final JsonNode rows;
        try {
            rows = objectMapper.readTree(jsonData);
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le contenu JSON du dataset est invalide.");
        }
        if (rows == null || !rows.isArray() || rows.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le contenu du dataset doit être un tableau JSON contenant au moins une ligne."
            );
        }
        if (rows.size() > 500_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un dataset ne peut pas dépasser 500 000 lignes.");
        }
        Set<String> columns = new HashSet<>();
        for (JsonNode row : rows) {
            if (!row.isObject()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Chaque ligne du dataset doit être un objet JSON."
                );
            }
            if (row.size() > 1_000) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une ligne dépasse la limite de 1 000 colonnes.");
            }
            row.fieldNames().forEachRemaining(columns::add);
            if (columns.size() > 1_000) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un dataset ne peut pas dépasser 1 000 colonnes.");
            }
        }
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
