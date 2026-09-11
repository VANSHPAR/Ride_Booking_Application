package com.example.UberReviewService.dtos;

import com.example.uberproject_entityservice.models.ExactLocation;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class DriverUpdateDto {

    private  String name;






    private String licenseNumber;





    private ExactLocation lastKnownLocation;


    private ExactLocation home;

    private String activeCity;

    private String aadharNumber;


    private Double rating;




    private boolean isAvailable;




}
