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
            // 3. For existing user: check if user is verified before generating token
            if (user.getIsVerified() == null || !user.getIsVerified()) {
                String redirectUrl = cleanFrontendUrl + "/oauth/callback?error=" + 
                    URLEncoder.encode("Please verify your email before logging in", StandardCharsets.UTF_8);
                getRedirectStrategy().sendRedirect(request, response, redirectUrl);
                return;
            }
        }

        // Generate JWT token only when user is verified
        String token = jwtUtil.generateToken(user);

        // Set HttpOnly cookie with secure flag on HTTPS
        boolean isSecure = request.isSecure() || cleanFrontendUrl.startsWith("https://") 
                || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        CookieUtils.addCookieToResponse(response, CookieUtils.createJwtCookie(token, isSecure));

        // Redirect user to frontend without exposing token in query parameter
        String redirectUrl = cleanFrontendUrl + "/oauth/callback";
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
