package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.Repository.UserRepository;

import java.util.Optional;

@Component
public class AuthHelper {

    @Autowired
    private UserRepository userRepository;

    /**
     * Safely retrieves the currently authenticated UserEntity regardless of whether
     * the user authenticated via JWT cookie, Authorization header, or OAuth2 session.
     * Throws 401 ResponseStatusException if not authenticated or not found in DB.
     */
    public UserEntity getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated. Please log in.");
        }

        // 1. Try resolving by userId from details if set as a Number (Integer/Long)
        Object details = auth.getDetails();
        if (details instanceof Number) {
            int id = ((Number) details).intValue();
            if (id > 0) {
                Optional<UserEntity> userOpt = userRepository.findById(id);
                if (userOpt.isPresent()) {
                    return userOpt.get();
                }
            }
        }

        // 2. Try resolving by principal name (username or email, case-insensitive)
        String principalName = auth.getName();
        if (principalName != null && !principalName.isBlank()) {
            String trimmed = principalName.trim();
            Optional<UserEntity> userOpt = userRepository.findByNameIgnoreCase(trimmed);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
            userOpt = userRepository.findByEmailIgnoreCase(trimmed);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
            userOpt = userRepository.findFirstByEmailIgnoreCase(trimmed);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
            userOpt = userRepository.findFirstByNameIgnoreCase(trimmed);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
        }

        // 3. Try resolving from OAuth2User principal attributes
        if (auth.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauthUser = (OAuth2User) auth.getPrincipal();
            String email = oauthUser.getAttribute("email");
            if (email != null && !email.isBlank()) {
                Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
                if (userOpt.isPresent()) {
                    return userOpt.get();
                }
            }
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found or session expired. Please log in again.");
    }

    /**
     * Safely retrieves the current user's ID as an int.
     */
    public int getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
}
