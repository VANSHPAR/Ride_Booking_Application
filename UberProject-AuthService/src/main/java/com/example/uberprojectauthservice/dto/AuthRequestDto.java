package com.example.uberprojectauthservice.dto;

import com.example.uberproject_entityservice.models.Role;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequestDto {
    private String email;

    private String password;

    private Role role;
}
