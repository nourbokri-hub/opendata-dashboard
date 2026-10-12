package com.polytch_intel.Projet_Federateur.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "datasets")
@CompoundIndexes({
        @CompoundIndex(
                name = "dataset_owner_archive_upload_date",
                def = "{ 'ownerId': 1, 'isArchived': 1, 'uploadDate': -1 }"
        ),
        @CompoundIndex(
                name = "dataset_archive_upload_date",
                def = "{ 'isArchived': 1, 'uploadDate': -1 }"
        )
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dataset {

    @Id
    private String id;

    private String name;
    private String uploadDate;

    private int rowsCount;
    private int colsCount;

    private boolean isArchived = false;

    // Stockage des données JSON du CSV (on garde un String pour rester flexible)
    private String jsonData;

    // Référence légère (on évite @DBRef pour rester simple et stable)
    private String ownerId;
}
