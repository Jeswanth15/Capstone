package edu.example.edu.Config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        String email = null;
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                logger.error("JWT token Invalid or expired");
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token, email)) {
                String role = jwtUtil.extractRole(token);

                if (role != null) {
                    role = role.trim().toUpperCase();
                } else {
                    role = "USER";
                }

                // 🔹 Add both raw and ROLE_ prefixed authorities
                java.util.List<SimpleGrantedAuthority> authorities = java.util.List.of(
                        new SimpleGrantedAuthority(role),
                        new SimpleGrantedAuthority("ROLE_" + role));

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, null,
                        authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // 🔹 DEBUG: log authorities
                System.out.println(">>> JWT FILTER: Authentication successful for: " + email);
                System.out.println(">>> JWT FILTER: Authorities set: " + authorities);
            } else {
                System.out.println(">>> JWT FILTER: Token validation FAILED for: " + email);
            }
        } else if (email != null) {
            System.out.println(">>> JWT FILTER: User already authenticated or context not null for: " + email);
        }

        chain.doFilter(request, response);
    }

}
