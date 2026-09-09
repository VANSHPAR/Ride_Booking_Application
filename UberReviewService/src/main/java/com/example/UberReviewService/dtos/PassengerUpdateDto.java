package com.example.UberReviewService.dtos;

import com.example.uberproject_entityservice.models.ExactLocation;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PassengerUpdateDto {

    private String email;
    private String name;




    private String phoneNumber;






    private Double rating;



    private ExactLocation lastKnownLocation;


    private ExactLocation home;
}
