package com.aiplacement.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class Judge0PropertiesTest {

    @Test
    void validateStartupConfig_invalidUrl_throwsIllegalStateException() {
        Judge0Properties invalidProps = new Judge0Properties();
        invalidProps.setUrl("invalid-url-without-scheme");

        assertThatThrownBy(invalidProps::validateStartupConfig)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid URL");
    }

    @Test
    void validateStartupConfig_nonLocalProfile_localhostUrl_throwsIllegalStateException() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        Judge0Properties prodProps = new Judge0Properties();
        prodProps.setEnvironment(env);
        prodProps.setUrl("http://localhost:2358");

        assertThatThrownBy(prodProps::validateStartupConfig)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JUDGE0_API_URL must be set in production");
    }

    @Test
    void validateStartupConfig_nonLocalProfile_blankWebhookSecret_throwsIllegalStateException() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"staging"});

        Judge0Properties stagingProps = new Judge0Properties();
        stagingProps.setEnvironment(env);
        stagingProps.setUrl("https://judge0.example.com");
        stagingProps.setWebhookSecret("");

        assertThatThrownBy(stagingProps::validateStartupConfig)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JUDGE0_WEBHOOK_SECRET must be set in production");
    }
}
