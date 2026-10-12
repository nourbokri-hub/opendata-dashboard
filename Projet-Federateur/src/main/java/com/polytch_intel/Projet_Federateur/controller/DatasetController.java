package com.polytch_intel.Projet_Federateur.controller;

import com.polytch_intel.Projet_Federateur.entity.Dataset;
import com.polytch_intel.Projet_Federateur.dto.DatasetCreateRequest;
import com.polytch_intel.Projet_Federateur.dto.DatasetUpdateRequest;
import com.polytch_intel.Projet_Federateur.service.DatasetService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/datasets")
public class DatasetController {
    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @GetMapping
    public List<Dataset> getActive(Authentication authentication) {
        return datasetService.getActive(authentication);
    }

    @GetMapping("/archives")
    public List<Dataset> getArchives(Authentication authentication) {
        return datasetService.getArchives(authentication);
    }

    @PostMapping("/upload")
    public Dataset upload(@Valid @RequestBody DatasetCreateRequest request, Authentication authentication) {
        return datasetService.save(request, authentication);
    }

    @PutMapping("/{id}")
    public Dataset update(@PathVariable String id, @Valid @RequestBody DatasetUpdateRequest request,
                          Authentication authentication) {
        return datasetService.update(id, request, authentication);
    }

    @PutMapping("/{id}/archive")
    public void archive(@PathVariable String id, Authentication authentication) {
        datasetService.toggleArchive(id, authentication);
    }

    @PutMapping("/{id}/unarchive")
    public void unarchive(@PathVariable String id, Authentication authentication) {
        datasetService.unarchive(id, authentication);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id, Authentication authentication) {
        datasetService.delete(id, authentication);
    }
}
