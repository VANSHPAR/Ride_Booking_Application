package com.example.uberprojectlocationservice.security;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
public class SecurityConfig {

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

                                .requestMatchers(HttpMethod.POST,"/api/location/drivers").hasRole("DRIVER")
                                .requestMatchers(HttpMethod.POST,"/api/location/nearby/drivers").hasAnyRole("PASSENGER","DRIVER")
                                .anyRequest()
                                .authenticated()



                )

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    // AuthenticationProvider provides different authentication schemes to be plugable in our application
    //AuthenticationProvider processes an authentication request and return authenticated obj..
}

