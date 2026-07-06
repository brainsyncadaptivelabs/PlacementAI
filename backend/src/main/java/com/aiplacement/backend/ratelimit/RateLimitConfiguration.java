package com.aiplacement.backend.ratelimit;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RateLimitConfiguration {

    @Bean
    public RateLimitFilter rateLimitFilter(RateLimitService rateLimitService, RateLimitProperties properties) {
        return new RateLimitFilter(rateLimitService, properties);
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(RateLimitFilter filter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false); // Enable manual registration in security chain instead
        return registration;
    }
}
