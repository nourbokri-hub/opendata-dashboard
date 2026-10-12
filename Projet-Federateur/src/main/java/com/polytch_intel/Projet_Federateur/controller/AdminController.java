package com.polytch_intel.Projet_Federateur.controller;

import com.polytch_intel.Projet_Federateur.dto.AdminStatsResponse;
import com.polytch_intel.Projet_Federateur.dto.UserResponse;
import com.polytch_intel.Projet_Federateur.entity.Dataset;
import com.polytch_intel.Projet_Federateur.service.AdminService;
import com.polytch_intel.Projet_Federateur.service.DatasetService;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private DatasetService datasetService;

    // ---- USERS ----
    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return adminService.listUsers().stream().map(UserResponse::from).toList();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ---- DATASETS ----
    @GetMapping("/datasets")
    public List<Dataset> listAllDatasets() {
        return adminService.listAllDatasets();
    }

    @PutMapping("/datasets/{id}/archive")
    public ResponseEntity<Void> toggleArchive(@PathVariable String id, Authentication authentication) {
        datasetService.toggleArchive(id, authentication);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/datasets/{id}/unarchive")
    public ResponseEntity<Void> unarchiveDataset(@PathVariable String id, Authentication authentication) {
        datasetService.unarchive(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/datasets/{id}")
    public ResponseEntity<Void> deleteDataset(@PathVariable String id, Authentication authentication) {
        datasetService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }

    // ---- STATS ----
    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(
                adminService.countUsers(),
                adminService.countDatasets(),
                adminService.countArchivedDatasets()
        );
    }
}
