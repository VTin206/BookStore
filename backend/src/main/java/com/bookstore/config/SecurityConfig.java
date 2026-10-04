package com.bookstore.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  SecurityFilterChain filter(HttpSecurity http, JwtFilter jwtFilter, RateLimitFilter rateLimitFilter) throws Exception {
    return http.csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, exception) -> {
          response.setStatus(401);
          response.setContentType("application/json;charset=UTF-8");
          response.getWriter().write("{\"message\":\"Vui lòng đăng nhập để tiếp tục.\"}");
        }))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(
                        "/api/auth/**",
                        "/api/books/**",
                        "/api/categories/**",
                        "/swagger-ui/**",
                        "/v3/api-docs/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/orders/lookup")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/orders", "/api/orders/quote")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/reviews/book/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/vouchers/validate")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(rateLimitFilter, JwtFilter.class)
        .build();
  }

  @Bean
  org.springframework.boot.web.servlet.FilterRegistrationBean<JwtFilter> jwtRegistration(JwtFilter filter) {
    var registration = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
  }

  @Bean
  org.springframework.boot.web.servlet.FilterRegistrationBean<RateLimitFilter> rateRegistration(RateLimitFilter filter) {
    var registration = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(filter);
    registration.setEnabled(false);
    return registration;
  }
}
