package com.example.UberReviewService.security;


import com.example.UberReviewService.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig  implements WebMvcConfigurer {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;



    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http.csrf(
                csrf -> csrf.disable()
        );
//       http.cors(cors -> cors.disable());
        http.cors(cors -> {});
        return http.authorizeHttpRequests(
                        auth -> auth

                                .requestMatchers("/api/v1/profile/passenger").hasRole("PASSENGER")
                                .requestMatchers("/api/v1/profile/driver").hasRole("DRIVER")
                                .requestMatchers("api/v1/reviews/**").authenticated()
                                .anyRequest()
                                .authenticated()



                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    // AuthenticationProvider provides different authentication schemes to be plugable in our application
    //AuthenticationProvider processes an authentication request and return authenticated obj..



    @Override
    public void addCorsMappings(CorsRegistry corsRegistry){
        corsRegistry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedHeaders("*")
                .allowCredentials(true)
                .allowedOriginPatterns("*")
                .allowedMethods("POST", "GET", "PUT", "DELETE", "OPTIONS");
    }
}

