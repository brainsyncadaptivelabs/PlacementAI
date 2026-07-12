package com.aiplacement.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import com.aiplacement.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    @Test
    void contextLoads() {
    }

    @Test
    void testSearchUsers() {
        userRepository.searchUsers(null, null, null, null, null, PageRequest.of(0, 10));
    }

}
