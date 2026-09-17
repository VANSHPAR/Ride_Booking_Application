package com.example.UberReviewService.dtos;

import com.example.uberproject_entityservice.models.ExactLocation;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PassengerResponseDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private ExactLocation lastKnownLocation;


    private ExactLocation home;











    private Double rating;




}
