package ec.example.sheprenure;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtils {

    public static final String COOKIE_NAME = "jwt_token";
    public static final long COOKIE_MAX_AGE_SECONDS = 60 * 60; // 1 hour (matching JWT validity)

    /**
     * Creates an HttpOnly JWT cookie.
     *
     * When isSecure=true (HTTPS/production on Render):
     *   → SameSite=None; Secure=true  (required for cross-origin cookie sending)
     *
     * When isSecure=false (local HTTP development):
     *   → SameSite=Lax; Secure=false  (most compatible for same-origin dev)
     */
    public static ResponseCookie createJwtCookie(String token, boolean isSecure) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(COOKIE_MAX_AGE_SECONDS)
                .sameSite(isSecure ? "None" : "Lax")
                .build();
    }

    /**
     * Creates an HttpOnly JWT cookie (always secure — use for HTTPS-only deployments).
     */
    public static ResponseCookie createJwtCookie(String token) {
        return createJwtCookie(token, true);
    }

    /**
     * Creates an HttpOnly cookie that clears the JWT (Max-Age=0) — for logout.
     *
     * SameSite must match the original cookie to correctly clear it in the browser.
     */
    public static ResponseCookie createCleanJwtCookie(boolean isSecure) {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(0)
                .sameSite(isSecure ? "None" : "Lax")
                .build();
    }

    /**
     * Creates an HttpOnly cookie that clears the JWT (always secure variant).
     */
    public static ResponseCookie createCleanJwtCookie() {
        return createCleanJwtCookie(true);
    }

    /**
     * Appends the given ResponseCookie to the response's Set-Cookie header.
     */
    public static void addCookieToResponse(HttpServletResponse response, ResponseCookie cookie) {
        if (response != null && cookie != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
    }

    /**
     * Extracts the JWT token string from the request cookies.
     */
    public static String getJwtFromCookies(HttpServletRequest request) {
        if (request == null || request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName()) || "token".equals(cookie.getName())) {
                String val = cookie.getValue();
                if (val != null && !val.isBlank()) {
                    return val.trim();
                }
            }
        }
        return null;
    }
}
