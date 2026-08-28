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

        if (email == null || email.isBlank()) {
            String redirectUrl = frontendUrl + "/oauth/callback?error=" + URLEncoder.encode("Email not provided by Google account", StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        // If name is null or blank, derive from email address
        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        // 1. If user exists by email, return / use existing account
        UserEntity user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Check if username is already taken by someone else, make it unique if necessary
            String finalName = name;
            if (userRepository.findByName(finalName).isPresent()) {
                finalName = name + "_" + (System.currentTimeMillis() % 10000);
            }

            // 2. If it's a new email, create account based on OAuth data and hardcode role as USER
            user = new UserEntity();
            user.setEmail(email);
            user.setName(finalName);
            user.setRole("USER");
            user.setIsVerified(true);
            user = userRepository.save(user);
        }

        // Generate JWT token for user session
        String token = jwtUtil.generateToken(user);

        // Redirect user to frontend with JWT token in query parameter
        String redirectUrl = frontendUrl + "/oauth/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
