package com.aiplacement.backend.rag;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import java.sql.Connection;
import java.sql.Statement;

@Configuration
public class RagConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/placementai}")
    private String dbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String dbUser;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${openai.api.key:dummy}")
    private String openAiApiKey;

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void initVectorExtension() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE EXTENSION IF NOT EXISTS vector;");
        } catch (Exception e) {
            System.err.println("Failed to create pgvector extension: " + e.getMessage());
        }
    }

    @Bean
    public EmbeddingModel embeddingModel() {
        return OpenAiEmbeddingModel.builder()
                .apiKey(openAiApiKey)
                .modelName("text-embedding-3-small")
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        String host = "localhost";
        int port = 5432;
        String dbName = "placementai";
        
        try {
            String cleanUrl = dbUrl.replace("jdbc:postgresql://", "");
            String[] parts = cleanUrl.split("/");
            String hostPort = parts[0];
            dbName = parts[1].split("\\?")[0];
            String[] hp = hostPort.split(":");
            host = hp[0];
            if(hp.length > 1) {
                port = Integer.parseInt(hp[1]);
            }
        } catch (Exception e) {
            // fallback
        }

        return PgVectorEmbeddingStore.builder()
                .host(host)
                .port(port)
                .database(dbName)
                .user(dbUser)
                .password(dbPassword)
                .table("company_questions_embeddings")
                .dimension(1536)
                .createTable(false)
                .dropTableFirst(false)
                .build();
    }
}
