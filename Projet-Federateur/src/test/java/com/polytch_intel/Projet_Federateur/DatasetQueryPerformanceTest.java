package com.polytch_intel.Projet_Federateur;

import com.mongodb.ExplainVerbosity;
import com.polytch_intel.Projet_Federateur.entity.Dataset;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DatasetQueryPerformanceTest extends BaseIntegrationTest {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Test
    void activeDatasetQuery_reportsExecutionMetricsForSyntheticData() {
        List<Dataset> fixture = new ArrayList<>(12_000);
        for (int index = 0; index < 12_000; index++) {
            Dataset dataset = new Dataset();
            dataset.setName("Performance dataset " + index);
            dataset.setOwnerId(index < 6_000 ? "benchmark-owner" : "other-owner");
            dataset.setArchived(index % 10 == 0);
            dataset.setUploadDate(String.format("%02d/10/2026", index % 31 + 1));
            dataset.setRowsCount(1);
            dataset.setColsCount(1);
            dataset.setJsonData("[{\"value\":1}]");
            fixture.add(dataset);
        }
        datasetRepository.saveAll(fixture);

        datasetRepository.findByOwnerIdAndIsArchivedFalseOrderByUploadDateDesc("benchmark-owner");
        List<Long> queryTimes = new ArrayList<>(5);
        List<Dataset> result = List.of();
        for (int attempt = 0; attempt < 5; attempt++) {
            long start = System.nanoTime();
            result = datasetRepository
                    .findByOwnerIdAndIsArchivedFalseOrderByUploadDateDesc("benchmark-owner");
            queryTimes.add((System.nanoTime() - start) / 1_000_000);
        }
        Collections.sort(queryTimes);
        long medianMillis = queryTimes.get(queryTimes.size() / 2);

        Document explain = mongoTemplate.execute("datasets", collection ->
                collection.find(new Document("ownerId", "benchmark-owner")
                                .append("isArchived", false))
                        .sort(new Document("uploadDate", -1))
                        .explain(ExplainVerbosity.EXECUTION_STATS));
        Document stats = (Document) explain.get("executionStats");
        Document queryPlanner = (Document) explain.get("queryPlanner");
        Document winningPlan = (Document) queryPlanner.get("winningPlan");
        String plan = winningPlan.toJson();

        assertEquals(5_400, result.size());
        assertEquals(5_400, stats.getInteger("nReturned"));
        assertEquals(5_400, stats.getInteger("totalDocsExamined"));
        assertTrue(plan.contains("IXSCAN"), "The owner/archive query must use a MongoDB index.");
        assertTrue(!plan.contains("\"stage\": \"SORT\""), "The index should also satisfy the sort.");
        System.out.printf(
                "DATASET_QUERY_BENCHMARK returned=%d elapsedMs=%d docsExamined=%s winningPlan=%s%n",
                result.size(),
                medianMillis,
                stats.get("totalDocsExamined"),
                plan
        );
    }
}
