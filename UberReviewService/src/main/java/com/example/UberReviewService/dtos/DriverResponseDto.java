package com.example.UberReviewService.dtos;

import com.example.uberproject_entityservice.models.ExactLocation;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DriverResponseDto {
    private Long id;
    private String email;
    private  String name;
    private String licenseNumber;
    private String phoneNumber;
    private ExactLocation lastKnownLocation;


    private ExactLocation home;

    private String activeCity;

    private String aadharNumber;


    private Double rating;
    private boolean isAvailable;






}
