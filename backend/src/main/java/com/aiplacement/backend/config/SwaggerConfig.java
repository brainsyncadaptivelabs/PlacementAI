package com.aiplacement.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration

public class SwaggerConfig {

    @Bean

    public OpenAPI customOpenAPI() {

        return new OpenAPI()

                .info(
                        new Info()

                                .title(
                                        "AI Placement Copilot API"
                                )

                                .version(
                                        "1.0"
                                )

                                .description(
                                        "AI-Powered Career Intelligence Backend APIs"
                                )
                );
    }
}