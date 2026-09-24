package ec.example.sheprenure;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.Repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private jwt jwtUtil;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        String cleanFrontendUrl = (frontendUrl != null ? frontendUrl.trim().replaceAll("/+$", "") : "http://localhost:5173");

        // If frontendUrl still points to localhost, but we are running in production on a remote domain (e.g. Render):
        String host = request.getHeader("Host");
        String proto = request.getHeader("X-Forwarded-Proto");
        if (proto == null || proto.isBlank()) {
            proto = request.isSecure() ? "https" : "http";
        }
        if (cleanFrontendUrl.contains("localhost") && host != null && !host.contains("localhost") && !host.contains("127.0.0.1")) {
            cleanFrontendUrl = proto + "://" + host;
        }

        if (email == null || email.isBlank()) {
            String redirectUrl = cleanFrontendUrl + "/oauth/callback?error=" + URLEncoder.encode("Email not provided by Google account", StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        // If name is null or blank, derive from email address
        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        // 1. If user exists by email, reuse existing account
        UserEntity user = userRepository.findFirstByEmail(email).orElse(null);

        if (user == null) {
            // Check if username is already taken by someone else, make it unique if necessary
            String finalName = name;
            if (userRepository.findByName(finalName).isPresent()) {
                finalName = name + "_" + (System.currentTimeMillis() % 10000);
            }

            // 2. If it's a new email, create account based on OAuth data and set as verified USER
            user = new UserEntity();
            user.setEmail(email);
            user.setName(finalName);
            user.setRole("USER");
            user.setIsVerified(true);
            user = userRepository.save(user);
        } else {
            // 3. For existing user: OAuth authentication proves ownership of the email,
            // so automatically mark user as verified if not already verified.
            if (user.getIsVerified() == null || !user.getIsVerified()) {
                user.setIsVerified(true);
                user = userRepository.save(user);
            }
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user);

        // Set HttpOnly cookie with secure flag on HTTPS
        boolean isSecure = request.isSecure() || cleanFrontendUrl.startsWith("https://") 
                || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        CookieUtils.addCookieToResponse(response, CookieUtils.createJwtCookie(token, isSecure));

        // Redirect user to frontend with token parameter as a resilient fallback
        // (in case browser blocks cross-origin cookies in dev or production)
        String redirectUrl = cleanFrontendUrl + "/oauth/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
