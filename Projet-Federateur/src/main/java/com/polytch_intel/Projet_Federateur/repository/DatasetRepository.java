package com.polytch_intel.Projet_Federateur.repository;

import com.polytch_intel.Projet_Federateur.entity.Dataset;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DatasetRepository extends MongoRepository<Dataset, String> {

    List<Dataset> findByIsArchivedFalseOrderByUploadDateDesc();

    List<Dataset> findByIsArchivedTrueOrderByUploadDateDesc();

    List<Dataset> findByOwnerIdAndIsArchivedFalseOrderByUploadDateDesc(String ownerId);

    List<Dataset> findByOwnerIdAndIsArchivedTrueOrderByUploadDateDesc(String ownerId);

    List<Dataset> findByOwnerId(String ownerId);
}
