package ec.example.sheprenure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

@Configuration
public class OAuth2ClientConfig {

    public static class OAuth2CredentialsCondition implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            Environment env = context.getEnvironment();
            String clientId = getProp(env, "GOOGLE_CLIENT_ID", "google.client-id", "spring.security.oauth2.client.registration.google.client-id");
            String clientSecret = getProp(env, "GOOGLE_CLIENT_SECRET", "google.client-secret", "spring.security.oauth2.client.registration.google.client-secret");
            return isValidCredential(clientId) && isValidCredential(clientSecret);
        }

        private static boolean isValidCredential(String value) {
            if (value == null || value.isBlank()) return false;
            String v = value.trim().toLowerCase();
            return !v.startsWith("your-") && !v.startsWith("your_") && !v.equals("placeholder");
        }
    }

    @Bean
    @Conditional(OAuth2CredentialsCondition.class)
    public ClientRegistrationRepository clientRegistrationRepository(Environment env) {
        String clientId = getProp(env, "GOOGLE_CLIENT_ID", "google.client-id", "spring.security.oauth2.client.registration.google.client-id");
        String clientSecret = getProp(env, "GOOGLE_CLIENT_SECRET", "google.client-secret", "spring.security.oauth2.client.registration.google.client-secret");

        ClientRegistration googleRegistration = CommonOAuth2Provider.GOOGLE.getBuilder("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .scope("openid", "profile", "email")
                .build();

        System.out.println("[OAuth2] Google OAuth2 ClientRegistration configured successfully.");
        return new InMemoryClientRegistrationRepository(googleRegistration);
    }

    private static String getProp(Environment env, String... keys) {
        for (String key : keys) {
            String val = env.getProperty(key);
            if (val != null && !val.isBlank()) {
                return val.trim();
            }
        }
        return null;
    }
}
