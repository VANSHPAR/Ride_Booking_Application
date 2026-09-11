package com.example.UberReviewService.dtos;

import com.example.uberproject_entityservice.models.ExactLocation;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PassengerUpdateDto {


    private String name;











    private Double rating;



    private ExactLocation lastKnownLocation;


    private ExactLocation home;
}
