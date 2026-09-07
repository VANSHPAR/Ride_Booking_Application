package com.example.uberprojectauthservice.configurations;

import com.example.uberprojectauthservice.filters.JwtAuthFilter;
import com.example.uberprojectauthservice.services.UserDetailsServiceimpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SpringSecurity  implements WebMvcConfigurer {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
   public UserDetailsService userDetailsService(){
       return new UserDetailsServiceimpl();
   }

   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
      http.csrf(
              csrf -> csrf.disable()
      );
//       http.cors(cors -> cors.disable());
       http.cors(cors -> {});
       return http.authorizeHttpRequests(
               auth -> auth
                       .requestMatchers("/api/v1/auth/signup/passenger",
                               "/api/v1/auth/signup/driver",
                               "/api/v1/auth/signin/passenger",
                               "/api/v1/auth/signin/driver").permitAll()

                       .requestMatchers("/api/v1/auth/validate").authenticated()

                       .requestMatchers("/api/v1/passenger/**").hasRole("PASSENGER")
                       .requestMatchers("/api/v1/driver/**").hasRole("DRIVER")
                       .anyRequest()
                       .authenticated()



       )
               .authenticationProvider(authenticationProvider())
               .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
               .build();
   }
   // AuthenticationProvider provides different authentication schemes to be plugable in our application
   //AuthenticationProvider processes an authentication request and return authenticated obj..
   @Bean
   public AuthenticationProvider authenticationProvider(){
       DaoAuthenticationProvider authenticationProvider=new DaoAuthenticationProvider();
       authenticationProvider.setUserDetailsService(userDetailsService());
       authenticationProvider.setPasswordEncoder(passwordEncoder());
       return authenticationProvider;

   }


   @Bean
   public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();

   }

   @Bean
   public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
   }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder(){
        return new BCryptPasswordEncoder();
    }

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
