package com.example.uberprojectauthservice.dto;

import com.example.uberproject_entityservice.models.Passenger;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerDto {

    private Long id;
    private String name;

    private String email;

    private String password; //encrypted password

    private String phoneNumber;

    private Date createdAt;

    public static PassengerDto from(Passenger passenger) {
        PassengerDto resuit=PassengerDto.builder()
                .id(passenger.getId())
                .name(passenger.getName())
                .email(passenger.getEmail())
                .password(passenger.getPassword())
                .phoneNumber(passenger.getPhoneNumber())
                .createdAt(passenger.getCreatedAt())
               .build();
        return resuit;
    }

}
