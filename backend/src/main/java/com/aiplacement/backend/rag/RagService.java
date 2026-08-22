package com.aiplacement.backend.rag;

import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.filter.MetadataFilterBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

    private static final int DEFAULT_MAX_RESULTS = 5;
    private static final double DEFAULT_MIN_SCORE = 0.7;

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    public RagService(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        this.embeddingStore = embeddingStore;
        this.embeddingModel = embeddingModel;
    }

    public void ingestQuestion(CompanyQuestionIngestionRequest request) {
        String content = "Company: " + request.getCompanyName() + "\nRole: " + request.getRole() + "\nQuestion: " + request.getQuestion();
        String companyRaw = request.getCompanyName() != null ? request.getCompanyName().trim() : "";
        String roleRaw = request.getRole() != null ? request.getRole().trim() : "";

        Metadata metadata = Metadata.from("company", companyRaw)
                .add("company_normalized", companyRaw.toLowerCase())
                .add("role", roleRaw);

        TextSegment segment = TextSegment.from(content, metadata);
        Embedding embedding = embeddingModel.embed(segment).content();
        embeddingStore.add(embedding, segment);
    }

    public List<String> retrieveHints(String companyName, String query) {
        Embedding queryEmbedding = embeddingModel.embed(query).content();

        EmbeddingSearchRequest.EmbeddingSearchRequestBuilder requestBuilder = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .maxResults(DEFAULT_MAX_RESULTS)
                .minScore(DEFAULT_MIN_SCORE);

        if (StringUtils.hasText(companyName)) {
            requestBuilder.filter(MetadataFilterBuilder.metadataKey("company_normalized")
                    .isEqualTo(companyName.trim().toLowerCase()));
        }

        EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(requestBuilder.build());
        return searchResult.matches().stream()
                .map(match -> match.embedded().text())
                .collect(Collectors.toList());
    }
}

