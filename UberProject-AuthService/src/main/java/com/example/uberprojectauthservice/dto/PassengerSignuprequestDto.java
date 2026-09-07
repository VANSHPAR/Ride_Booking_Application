package com.example.uberprojectauthservice.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerSignuprequestDto {
    private String email;

    private String password;

    private String phoneNumber;

    private String name;
}
