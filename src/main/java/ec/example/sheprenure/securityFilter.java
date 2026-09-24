package ec.example.sheprenure;

import java.io.IOException;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.Repository.BlocklistRepository;
import ec.example.sheprenure.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.*;

@Component
public class securityFilter extends OncePerRequestFilter {
    @Autowired
    private BlocklistRepository brepo;

    @Autowired
    private UserRepository urepo;

    @Autowired
    private jwt jt;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Allow preflight OPTIONS requests to pass through for CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // 1. Bypass authentication for public auth endpoints and OAuth redirects
        if (path.equals("/login") || path.startsWith("/user/register") || path.contains("/forgotpassword")
            || path.startsWith("/oauth2/") || path.startsWith("/login/oauth2/") || path.startsWith("/oauth/")
            || path.equals("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Bypass authentication for static assets and client-side SPA pages
        // (API endpoints like /user/getall, /admin/**, /cart/**, etc. are NOT bypassed)
        if (path.equals("/") || path.equals("/index.html") || path.startsWith("/assets/")
            || path.endsWith(".js") || path.endsWith(".css") || path.endsWith(".svg")
            || path.endsWith(".ico") || path.endsWith(".png") || path.endsWith(".jpg")
            || path.endsWith(".jpeg") || path.equals("/favicon.ico") || path.equals("/favicon.svg")
            || path.equals("/_redirects")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. For GET requests to SPA navigation routes that are NOT backend API routes,
        // let them pass through so SpaController forwards to index.html
        if ("GET".equalsIgnoreCase(request.getMethod())) {
            if (path.equals("/dashboard") || path.startsWith("/dashboard/")
                || path.equals("/cart") || path.equals("/orders") || path.equals("/profile")
                || path.equals("/register") || path.equals("/forgot-password")
                || (path.startsWith("/products") && !path.startsWith("/products/api"))) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        String token = CookieUtils.getJwtFromCookies(request);

        if (token == null || token.isBlank()) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                token = header.substring(7);
            }
        }

        String name = null;
        String role = null;
        String email = null;
        int id = -1;

        if (token != null && !token.isBlank()) {
            if (!jt.validate(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired token. Please log in.\"}");
                return;
            }

            // blacklist check
            if (brepo.existsByToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Session has expired. Please log in again.\"}");
                return;
            }

            name = jt.extractUserName(token);
            id = jt.extractId(token);
            email = jt.extractEmail(token);
            role = jt.ExtractRole(token);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication token is missing. Please log in.\"}");
            return;
        }

        // Validate and resolve user against database to guarantee existence
        Optional<UserEntity> userOpt = Optional.empty();

        if (id > 0) {
            userOpt = urepo.findById(id);
        }

        if (userOpt.isEmpty() && email != null && !email.isBlank()) {
            userOpt = urepo.findByEmailIgnoreCase(email.trim());
        }

        if (userOpt.isEmpty() && name != null && !name.isBlank()) {
            userOpt = urepo.findByNameIgnoreCase(name.trim());
            if (userOpt.isEmpty()) {
                userOpt = urepo.findByEmailIgnoreCase(name.trim());
            }
        }

        if (userOpt.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"User account not found. Please log in again.\"}");
            return;
        }

        UserEntity user = userOpt.get();
        id = user.getUserId();
        name = user.getName();
        if (role == null || role.isBlank()) {
            role = user.getRole() != null ? user.getRole() : "USER";
        }

        List<GrantedAuthority> roles = new ArrayList<>();
        String normalizedRole = role.trim().toUpperCase();
        if (normalizedRole.startsWith("ROLE_")) {
            roles.add(new SimpleGrantedAuthority(normalizedRole));
        } else {
            roles.add(new SimpleGrantedAuthority("ROLE_" + normalizedRole));
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(name, null, roles);
        auth.setDetails(id);
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}
