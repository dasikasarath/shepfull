package ec.example.sheprenure;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Fallback controller for OAuth authorization requests when Google credentials
 * (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured on the server.
 *
 * When credentials ARE configured, Spring Security's OAuth2AuthorizationRequestRedirectFilter
 * handles the request and redirects to Google directly.
 * When credentials are NOT configured, this fallback catches the request and redirects
 * the user back to the frontend callback page with a clear, helpful message instead of a 404.
 */
@Controller
public class OAuthFallbackController {

    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping("/oauth2/authorization/{provider}")
    public String handleUnconfiguredOAuth(@PathVariable String provider) {
        if (clientRegistrationRepository == null) {
            String cleanFrontend = (frontendUrl != null ? frontendUrl.trim().replaceAll("/+$", "") : "http://localhost:5173");
            String message = "Google Sign-in is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment or application.properties.";
            return "redirect:" + cleanFrontend + "/oauth/callback?error=" + URLEncoder.encode(message, StandardCharsets.UTF_8);
        }
        return "redirect:/";
    }
}
