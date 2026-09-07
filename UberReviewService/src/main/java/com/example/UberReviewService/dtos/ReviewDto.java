package com.example.UberReviewService.dtos;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    private String content;
    private Double rating;
    private Long booking;
    private Date createdAt;
    private Date updatedAt;


}
