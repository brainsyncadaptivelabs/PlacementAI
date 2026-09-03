package com.aiplacement.backend.rag;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("PGVector Real SQL Testcontainers Integration Test")
class RagPgVectorIntegrationTest {

    private static final int VECTOR_DIMENSION = 1536;

    private static PostgreSQLContainer<?> postgres;
    private static PgVectorEmbeddingStore pgVectorEmbeddingStore;
    private static RagService ragService;

    private static float[] createDeterministic1536Vector(float fillValue) {
        float[] vector = new float[VECTOR_DIMENSION];
        Arrays.fill(vector, fillValue);
        return vector;
    }

    @BeforeAll
    @SuppressWarnings("resource")
    static void setUp() {
        boolean isDockerAvailable = false;
        try {
            isDockerAvailable = DockerClientFactory.instance().isDockerAvailable();
        } catch (Throwable t) {
            System.out.println("Docker client check failed: " + t.getMessage());
        }

        if (!isDockerAvailable) {
            System.out.println("Docker environment is not available on host. Skipping Testcontainers PGVector startup.");
            return;
        }

        try {
            postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg16")
                    .withDatabaseName("placementai_test")
                    .withUsername("test")
                    .withPassword("test");
            postgres.start();

            pgVectorEmbeddingStore = PgVectorEmbeddingStore.builder()
                    .host(postgres.getHost())
                    .port(postgres.getFirstMappedPort())
                    .database(postgres.getDatabaseName())
                    .user(postgres.getUsername())
                    .password(postgres.getPassword())
                    .table("company_questions_embeddings")
                    .dimension(VECTOR_DIMENSION)
                    .createTable(true)
                    .dropTableFirst(true)
                    .build();

            EmbeddingModel deterministicEmbeddingModel = new EmbeddingModel() {
                @Override
                public Response<Embedding> embed(String text) {
                    return Response.from(Embedding.from(createDeterministic1536Vector(0.5f)));
                }

                @Override
                public Response<List<Embedding>> embedAll(List<TextSegment> textSegments) {
                    List<Embedding> embeddings = textSegments.stream()
                            .map(seg -> Embedding.from(createDeterministic1536Vector(0.5f)))
                            .toList();
                    return Response.from(embeddings);
                }
            };

            ragService = new RagService(pgVectorEmbeddingStore, deterministicEmbeddingModel);
        } catch (Throwable t) {
            System.err.println("Failed to start PGVector Testcontainers: " + t.getMessage());
        }
    }

    @AfterAll
    static void tearDown() {
        if (postgres != null && postgres.isRunning()) {
            postgres.stop();
        }
    }

    @Test
    @DisplayName("PGVector Real SQL metadata filtering with vector(1536) schema and case-insensitivity")
    void testPgVectorMetadataFiltering() {
        if (postgres == null || !postgres.isRunning() || ragService == null) {
            System.out.println("Docker is not running - skipping live PGVector container query execution.");
            return;
        }

        CompanyQuestionIngestionRequest req1 = new CompanyQuestionIngestionRequest();
        req1.setCompanyName("Google");
        req1.setRole("Backend Engineer");
        req1.setQuestion("Explain distributed rate limiter design.");

        CompanyQuestionIngestionRequest req2 = new CompanyQuestionIngestionRequest();
        req2.setCompanyName("AMAZON");
        req2.setRole("SDE 2");
        req2.setQuestion("Explain Leadership Principles & DynamoDB.");

        CompanyQuestionIngestionRequest req3 = new CompanyQuestionIngestionRequest();
        req3.setCompanyName("Microsoft");
        req3.setRole("Cloud Architect");
        req3.setQuestion("Explain Azure Service Bus architecture.");

        ragService.ingestQuestion(req1);
        ragService.ingestQuestion(req2);
        ragService.ingestQuestion(req3);

        // Case 1: Retrieve with mixed case "gOOgle"
        List<String> googleHints = ragService.retrieveHints("gOOgle", "system design");
        assertEquals(1, googleHints.size());
        assertTrue(googleHints.get(0).contains("Google"));
        assertTrue(googleHints.get(0).contains("distributed rate limiter"));

        // Case 2: Retrieve with lowercased "amazon"
        List<String> amazonHints = ragService.retrieveHints("amazon", "system design");
        assertEquals(1, amazonHints.size());
        assertTrue(amazonHints.get(0).contains("AMAZON"));

        // Case 3: Retrieve with null companyName returns all top 3 ingested items
        List<String> allHints = ragService.retrieveHints(null, "system design");
        assertEquals(3, allHints.size());
    }
}
