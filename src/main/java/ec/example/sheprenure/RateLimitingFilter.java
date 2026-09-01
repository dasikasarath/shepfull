package ec.example.sheprenure;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate-limiting filter for public endpoints using Bucket4J.
 *
 * Limits are applied per client IP:
 *   POST /login                 → 5 requests / 1 minute
 *   POST /user/register         → 10 requests / 1 hour
 *   POST /forgotpassword/**     → 5 requests / 15 minutes
 *
 * All other endpoints are skipped (authenticated routes are unaffected).
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Separate bucket maps per endpoint group
    private final ConcurrentHashMap<String, Bucket> loginBuckets        = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> registerBuckets     = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Bucket> forgotPwdBuckets    = new ConcurrentHashMap<>();

    // --- Bucket factories ---------------------------------------------------

    private Bucket buildLoginBucket() {
        // 5 requests per minute
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillGreedy(5, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket buildRegisterBucket() {
        // 10 requests per hour
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofHours(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket buildForgotPasswordBucket() {
        // 5 requests per 15 minutes
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillGreedy(5, Duration.ofMinutes(15))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    // -------------------------------------------------------------------------

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path   = request.getServletPath();
        String method = request.getMethod();
        String ip     = resolveClientIp(request);

        Bucket bucket = resolveBucket(path, method, ip);

        if (bucket == null) {
            // Not a rate-limited public endpoint — pass through
            filterChain.doFilter(request, response);
            return;
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            rejectRequest(response, path);
        }
    }

    /**
     * Returns the appropriate bucket for the request, or null if this
     * endpoint is not subject to rate limiting.
     */
    private Bucket resolveBucket(String path, String method, String ip) {
        if ("POST".equalsIgnoreCase(method) && "/login".equals(path)) {
            return loginBuckets.computeIfAbsent(ip, k -> buildLoginBucket());
        }
        // Cover /user/register, /user/register/send-otp, /user/register/verify-otp
        if ("POST".equalsIgnoreCase(method) && path.startsWith("/user/register")) {
            return registerBuckets.computeIfAbsent(ip, k -> buildRegisterBucket());
        }
        if (path.startsWith("/forgotpassword/")) {
            return forgotPwdBuckets.computeIfAbsent(ip, k -> buildForgotPasswordBucket());
        }
        return null;
    }

    /**
     * Extracts the real client IP, respecting common reverse-proxy headers.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // X-Forwarded-For can be a comma-separated list; take the first entry
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Writes a 429 JSON response when the rate limit is exceeded.
     */
    private void rejectRequest(HttpServletResponse response, String path) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
            "{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded for " + path + ". Please try again later.\",\"status\":429}"
        );
    }
}
