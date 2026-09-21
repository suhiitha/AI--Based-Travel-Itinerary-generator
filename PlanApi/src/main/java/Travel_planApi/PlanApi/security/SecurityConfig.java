package Travel_planApi.PlanApi.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — using AntPathRequestMatcher for reliable matching
                .requestMatchers(new AntPathRequestMatcher("/ulogin", "POST")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/registor/PostR", "POST")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/admin/login", "POST")).permitAll()

                .requestMatchers(new AntPathRequestMatcher("/api/itinerary/all", "GET")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/itinerary/districts", "GET")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/itinerary/filter", "GET")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/admin/categories", "GET")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/admin/tripTypes", "GET")).permitAll()

                // Admin-only endpoints
                .requestMatchers(new AntPathRequestMatcher("/api/registor/all", "GET")).hasRole("ADMIN")
                .requestMatchers(new AntPathRequestMatcher("/api/registor/delete/**", "DELETE")).hasRole("ADMIN")
                .requestMatchers(new AntPathRequestMatcher("/api/admin/getdata", "GET")).hasRole("ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
