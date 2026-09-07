package com.example.uberprojectauthservice.filters;

import com.example.uberprojectauthservice.services.JwtService;
import com.example.uberprojectauthservice.services.UserDetailsServiceimpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Autowired
    private UserDetailsServiceimpl userDetailsService;

    private final RequestMatcher urlMatcher = new RegexRequestMatcher("/api/v1/auth/validate", HttpMethod.GET.name());

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token=null;
        if(request.getCookies()!=null){
            for(Cookie cookie:request.getCookies()){
                if(cookie.getName().equals("jwtToken")){
                    token=cookie.getValue();
                }
            }
        }
        if(token==null){
            //user has not provided jwt token hence request should not move forward
            System.out.println("token is null");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        System.out.println("Incoming token "+token);
        String email=jwtService.extractEmail(token);
        System.out.println(email);

        if(email!=null){
            UserDetails userDetails=userDetailsService.loadUserByUsername(email);
            if(jwtService.validateToken(token,userDetails.getUsername())){
                //Usernamepasswordauthenticationtoken class :-An authentication that is designed for simple presentation of username and passwd
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken=new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        System.out.println("Forwarding req");
    filterChain.doFilter(request,response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
//    RequestMatcher requestMatcher=new NegatedRequestMatcher(urlMatcher);
//        return requestMatcher.matches(request);
       // return false;
        String path = request.getRequestURI();

        return path.equals("/api/v1/auth/signup/passenger")
                || path.equals("/api/v1/auth/signup/driver")
                || path.equals("/api/v1/auth/signin/passenger")
                || path.equals("/api/v1/auth/signin/driver");

    }
}
