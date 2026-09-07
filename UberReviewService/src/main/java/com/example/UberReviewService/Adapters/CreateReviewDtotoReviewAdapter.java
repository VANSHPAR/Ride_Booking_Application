package com.example.UberReviewService.Adapters;

import com.example.UberReviewService.dtos.CreateReviewDto;
import com.example.uberproject_entityservice.models.Review;


public interface CreateReviewDtotoReviewAdapter {

    public Review convertDto(CreateReviewDto createReviewDto);
}
