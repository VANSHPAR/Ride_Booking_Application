package com.example.UberReviewService.dtos;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewDto {

    private String content;

    private String name;

    private Long bookingId;

    private double rating;
}
