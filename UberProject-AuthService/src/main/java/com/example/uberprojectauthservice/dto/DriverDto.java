package com.example.uberprojectauthservice.dto;

import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDto {
    private Long id;
    private String name;

    private String email;

    private String password; //encrypted password

    private String phoneNumber;

    private Date createdAt;

    private String licenseNumber;

    public static DriverDto from(Driver driver){
        DriverDto d=DriverDto.builder()
                .id(driver.getId())
                .name(driver.getName())
                .email(driver.getEmail()).password(driver.getPassword()).phoneNumber(driver.getPhoneNumber())
                .licenseNumber(driver.getLicenseNumber())
                .createdAt(driver.getCreatedAt()).build();

        return  d;

    }
}
