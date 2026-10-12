package com.polytch_intel.Projet_Federateur.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminStatsResponse {
    private long usersCount;
    private long datasetsCount;
    private long archivedDatasetsCount;
}
