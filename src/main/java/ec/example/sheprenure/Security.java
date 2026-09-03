package ec.example.sheprenure;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class Security {

    @Autowired
    private securityFilter securityFilter;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @Autowired(required = false)
    private OAuthSuccessHandler oAuthSuccessHandler;

    @Autowired(required = false)
    private OAuthFailureHandler oAuthFailureHandler;

    @Autowired(required = false)
    private org.springframework.security.oauth2.client.registration.ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource));

        http.csrf(csrf -> csrf.disable());

        // Rate limiting runs first, before JWT auth, so exhausted requests
        // are rejected immediately without any token processing overhead.
        http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        http.authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/login", "/user/register/**", "/forgotpassword/**", "/oauth2/**", "/login/oauth2/**", "/oauth/**").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
            .anyRequest().authenticated()
        );

        if (clientRegistrationRepository != null) {
            http.oauth2Login(oauth2 -> {
                oauth2.clientRegistrationRepository(clientRegistrationRepository);
                if (oAuthSuccessHandler != null) {
                    oauth2.successHandler(oAuthSuccessHandler);
                }
                if (oAuthFailureHandler != null) {
                    oauth2.failureHandler(oAuthFailureHandler);
                }
            });
        }

        return http.build();
    }
}
