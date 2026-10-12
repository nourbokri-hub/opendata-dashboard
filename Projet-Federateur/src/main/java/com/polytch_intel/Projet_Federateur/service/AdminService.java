package com.polytch_intel.Projet_Federateur.service;

import com.polytch_intel.Projet_Federateur.entity.Dataset;
import com.polytch_intel.Projet_Federateur.entity.User;
import com.polytch_intel.Projet_Federateur.repository.DatasetRepository;
import com.polytch_intel.Projet_Federateur.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DatasetRepository datasetRepository;

    public List<User> listUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(String id) {
        // Pour éviter une erreur FK si des datasets pointent encore sur ce user,
        // on détache d'abord l'owner des datasets.
        List<Dataset> owned = datasetRepository.findByOwnerId(id);
        for (Dataset ds : owned) {
            ds.setOwnerId(null);
        }
        datasetRepository.saveAll(owned);

        userRepository.deleteById(id);
    }

    public List<Dataset> listAllDatasets() {
        List<Dataset> all = datasetRepository.findAll();
        final SimpleDateFormat fmt = new SimpleDateFormat("dd/MM/yyyy");

        all.sort(Comparator.comparing((Dataset d) -> {
            try {
                return d.getUploadDate() == null ? null : fmt.parse(d.getUploadDate());
            } catch (ParseException e) {
                return null;
            }
        }, Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        return all;
    }

    public long countUsers() {
        return userRepository.count();
    }

    public long countDatasets() {
        return datasetRepository.count();
    }

    public long countArchivedDatasets() {
        return datasetRepository.findByIsArchivedTrueOrderByUploadDateDesc().size();
    }
}
