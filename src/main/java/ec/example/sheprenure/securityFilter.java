package ec.example.sheprenure;

import java.io.IOException;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import ec.example.sheprenure.Repository.BlocklistRepository;

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
        if (path.equals("/login") || path.equals("/user/register") || path.contains("/forgotpassword")) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token = null;
        String name = null;
        String role = null;
        int id = -1;

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);

            if (!jt.validate(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("invalid token");
                return;
            }

            // blacklist check
            if (brepo.existsByToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("login first");
                return;
            }

            name = jt.extractUserName(token);
            id = jt.extractId(token);
            role = jt.ExtractRole(token);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("token missing");
            return;
        }

        if (name != null && id != -1 && role != null) {
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
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("invalid token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}

