package com.aiplacement.backend.rag;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.model.embedding.EmbeddingModel;

import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.DisplayName;

@ExtendWith(MockitoExtension.class)
@DisplayName("Fast Unit Test: RagService Filter-Building & Normalization Logic")
class RagServiceTest {

    @Mock
    private EmbeddingStore<TextSegment> mockEmbeddingStore;

    @Mock
    private EmbeddingModel mockEmbeddingModel;

    private RagService ragServiceWithMock;

    @BeforeEach
    void setUp() {
        ragServiceWithMock = new RagService(mockEmbeddingStore, mockEmbeddingModel);
    }

    @Test
    void retrieveHints_withCompanyName_appliesNormalizedMetadataFilter() {
        Embedding dummyQueryEmbedding = Embedding.from(new float[]{0.1f, 0.2f, 0.3f});
        when(mockEmbeddingModel.embed("system design questions")).thenReturn(Response.from(dummyQueryEmbedding));

        EmbeddingSearchResult<TextSegment> emptyResult = new EmbeddingSearchResult<>(Collections.emptyList());
        when(mockEmbeddingStore.search(any(EmbeddingSearchRequest.class))).thenReturn(emptyResult);

        ragServiceWithMock.retrieveHints("  Google  ", "system design questions");

        ArgumentCaptor<EmbeddingSearchRequest> captor = ArgumentCaptor.forClass(EmbeddingSearchRequest.class);
        verify(mockEmbeddingStore).search(captor.capture());

        EmbeddingSearchRequest request = captor.getValue();
        assertNotNull(request);
        assertEquals(dummyQueryEmbedding, request.queryEmbedding());
        assertEquals(5, request.maxResults());
        assertEquals(0.7, request.minScore());

        assertNotNull(request.filter(), "Filter should be populated when companyName is provided");
    }

    @Test
    void retrieveHints_withNullOrBlankCompanyName_noFilterApplied() {
        Embedding dummyQueryEmbedding = Embedding.from(new float[]{0.1f, 0.2f});
        when(mockEmbeddingModel.embed(anyString())).thenReturn(Response.from(dummyQueryEmbedding));

        EmbeddingSearchResult<TextSegment> emptyResult = new EmbeddingSearchResult<>(Collections.emptyList());
        when(mockEmbeddingStore.search(any(EmbeddingSearchRequest.class))).thenReturn(emptyResult);

        // Case A: null companyName
        ragServiceWithMock.retrieveHints(null, "query");
        ArgumentCaptor<EmbeddingSearchRequest> captorNull = ArgumentCaptor.forClass(EmbeddingSearchRequest.class);
        verify(mockEmbeddingStore, times(1)).search(captorNull.capture());
        assertNull(captorNull.getValue().filter(), "Filter should be null for null companyName");

        // Case B: blank companyName ""
        ragServiceWithMock.retrieveHints("", "query");
        ArgumentCaptor<EmbeddingSearchRequest> captorBlank = ArgumentCaptor.forClass(EmbeddingSearchRequest.class);
        verify(mockEmbeddingStore, times(2)).search(captorBlank.capture());
        assertNull(captorBlank.getValue().filter(), "Filter should be null for empty companyName");

        // Case C: whitespace companyName "   "
        ragServiceWithMock.retrieveHints("   ", "query");
        ArgumentCaptor<EmbeddingSearchRequest> captorSpaces = ArgumentCaptor.forClass(EmbeddingSearchRequest.class);
        verify(mockEmbeddingStore, times(3)).search(captorSpaces.capture());
        assertNull(captorSpaces.getValue().filter(), "Filter should be null for whitespace companyName");
    }

    @Test
    void retrieveHints_caseInsensitiveFiltering_returnsCorrectMatches_integration() {
        InMemoryEmbeddingStore<TextSegment> realInMemoryStore = new InMemoryEmbeddingStore<>();
        EmbeddingModel deterministicEmbeddingModel = new EmbeddingModel() {
            @Override
            public Response<Embedding> embed(String text) {
                // Return uniform dummy vector
                return Response.from(Embedding.from(new float[]{0.5f, 0.5f, 0.5f}));
            }

            @Override
            public Response<List<Embedding>> embedAll(List<TextSegment> textSegments) {
                List<Embedding> embeddings = textSegments.stream()
                        .map(seg -> Embedding.from(new float[]{0.5f, 0.5f, 0.5f}))
                        .toList();
                return Response.from(embeddings);
            }
        };

        RagService integrationRagService = new RagService(realInMemoryStore, deterministicEmbeddingModel);

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

        integrationRagService.ingestQuestion(req1);
        integrationRagService.ingestQuestion(req2);
        integrationRagService.ingestQuestion(req3);

        // Test case 1: Filtering by lowercased/mixed-case query "gOOgle"
        List<String> googleHints = integrationRagService.retrieveHints("gOOgle", "system design");
        assertEquals(1, googleHints.size());
        assertTrue(googleHints.get(0).contains("Google"));
        assertTrue(googleHints.get(0).contains("distributed rate limiter"));

        // Test case 2: Filtering by lowercased query "amazon"
        List<String> amazonHints = integrationRagService.retrieveHints("amazon", "system design");
        assertEquals(1, amazonHints.size());
        assertTrue(amazonHints.get(0).contains("AMAZON"));

        // Test case 3: Null/blank company returns all results up to maxResults (3 ingested items)
        List<String> allHints = integrationRagService.retrieveHints(null, "system design");
        assertEquals(3, allHints.size());
    }
}
