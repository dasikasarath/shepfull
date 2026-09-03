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
     * Creates an HttpOnly ResponseCookie with the JWT token.
     */
    public static ResponseCookie createJwtCookie(String token, boolean secure) {
        return ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(COOKIE_MAX_AGE_SECONDS)
                .sameSite(secure ? "None" : "Lax")
                .partitioned(true)
                .build();
    }

    /**
     * Creates an HttpOnly ResponseCookie to delete the JWT cookie (Max-Age=0).
     */
    public static ResponseCookie createCleanJwtCookie(boolean secure) {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite(secure ? "None" : "Lax")
                .partitioned(true)
                .build();
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
