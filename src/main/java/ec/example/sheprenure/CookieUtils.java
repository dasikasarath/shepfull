package ec.example.sheprenure;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CookieUtils {

    public static final String COOKIE_NAME = "jwt_token";
    public static final String ALT_COOKIE_NAME = "token";
    public static final long COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours

    /**
     * Creates an HttpOnly JWT cookie with specified cookie name.
     */
    public static ResponseCookie createCookie(String cookieName, String token, boolean isSecure) {
        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(COOKIE_MAX_AGE_SECONDS)
                .sameSite(isSecure ? "Lax" : "Lax")
                .build();
    }

    /**
     * Creates an HttpOnly JWT cookie for COOKIE_NAME ("jwt_token").
     */
    public static ResponseCookie createJwtCookie(String token, boolean isSecure) {
        return createCookie(COOKIE_NAME, token, isSecure);
    }

    public static ResponseCookie createJwtCookie(String token) {
        return createJwtCookie(token, true);
    }

    /**
     * Creates a clearing HttpOnly cookie (Max-Age=0).
     */
    public static ResponseCookie createCleanCookie(String cookieName, boolean isSecure) {
        return ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(isSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    public static ResponseCookie createCleanJwtCookie(boolean isSecure) {
        return createCleanCookie(COOKIE_NAME, isSecure);
    }

    public static ResponseCookie createCleanJwtCookie() {
        return createCleanJwtCookie(true);
    }

    /**
     * Appends a cookie to the response Set-Cookie header.
     */
    public static void addCookieToResponse(HttpServletResponse response, ResponseCookie cookie) {
        if (response != null && cookie != null) {
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
    }

    /**
     * Sets BOTH 'jwt_token' and 'token' HttpOnly cookies on the response.
     * Ensures all clients and middlewares find the authentication cookie regardless of naming preference.
     */
    public static void addAuthCookies(HttpServletResponse response, String token, boolean isSecure) {
        if (response != null && token != null && !token.isBlank()) {
            addCookieToResponse(response, createCookie(COOKIE_NAME, token, isSecure));
            addCookieToResponse(response, createCookie(ALT_COOKIE_NAME, token, isSecure));
        }
    }

    /**
     * Clears BOTH 'jwt_token' and 'token' cookies on the response (for logout).
     */
    public static void clearAuthCookies(HttpServletResponse response, boolean isSecure) {
        if (response != null) {
            addCookieToResponse(response, createCleanCookie(COOKIE_NAME, isSecure));
            addCookieToResponse(response, createCleanCookie(ALT_COOKIE_NAME, isSecure));
        }
    }

    /**
     * Extracts the JWT token string from the request cookies (checks 'jwt_token' first, then 'token').
     */
    public static String getJwtFromCookies(HttpServletRequest request) {
        if (request == null || request.getCookies() == null) {
            return null;
        }

        // 1. First check 'jwt_token'
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                String val = cookie.getValue();
                if (val != null && !val.isBlank()) {
                    return val.trim();
                }
            }
        }

        // 2. Fall back to 'token'
        for (Cookie cookie : request.getCookies()) {
            if (ALT_COOKIE_NAME.equals(cookie.getName())) {
                String val = cookie.getValue();
                if (val != null && !val.isBlank()) {
                    return val.trim();
                }
            }
        }

        return null;
    }
}
