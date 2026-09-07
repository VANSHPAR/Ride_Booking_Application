package com.example.uberprojectauthservice.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverSignuprequestDto {
    private String email;

    private String password;

    private String phoneNumber;

    private String name;

    private String licenseNumber;
}
