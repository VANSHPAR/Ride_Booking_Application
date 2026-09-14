package com.example.uberbookingservice.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {


    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("jwtToken")) {
                    token = cookie.getValue();
                }
            }
        }
        if (token == null) {
            //user has not provided jwt token hence request should not move forward
            System.out.println("token is null");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        System.out.println("Incoming token " + token);
        String email = jwtService.extractEmail(token);
        System.out.println(email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String role = jwtService.extractRole(token);

            if (jwtService.validateToken(token, email)) {
                //Usernamepasswordauthenticationtoken class :-An authentication that is designed for simple presentation of username and passwd
                String authorityName = (role != null && role.startsWith("ROLE_")) ? role : "ROLE_" + role;
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(authorityName);
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(email, null, List.of(authority));

                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        System.out.println("Forwarding req");
        filterChain.doFilter(request, response);
    }
}
