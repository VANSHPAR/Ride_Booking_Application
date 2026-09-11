package com.example.UberReviewService.Controller;

import com.example.UberReviewService.Adapters.CreateReviewDtotoReviewAdapter;

import com.example.UberReviewService.Services.ReviewService;
import com.example.UberReviewService.dtos.CreateReviewDto;
import com.example.UberReviewService.dtos.ReviewDto;

import com.example.uberproject_entityservice.models.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private ReviewService reviewService;
    private CreateReviewDtotoReviewAdapter createReviewDtotoReviewAdapter;

    public ReviewController(ReviewService reviewService, CreateReviewDtotoReviewAdapter createReviewDtotoReviewAdapter) {
        this.reviewService = reviewService;
        this.createReviewDtotoReviewAdapter = createReviewDtotoReviewAdapter;
    }

    @PostMapping
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<?> publishReview(@RequestBody CreateReviewDto request) {
        Review r=this.createReviewDtotoReviewAdapter.convertDto(request);
        if(r==null){
            return new ResponseEntity<>("Invalid argument",HttpStatus.BAD_REQUEST);

        }

        Review review = this.reviewService.publishReview(r);
        ReviewDto response=ReviewDto.builder()
                .id(review.getId())
                .content(review.getContent())
                .rating(review.getRating())
                .booking(review.getBooking().getId())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt()).build();
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PASSENGER', 'DRIVER')")
    public ResponseEntity<List<Review>> getAllReviews(){
        List<Review> reviews = this.reviewService.findAllReviews();
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> findReviewById(@PathVariable Long reviewId) {
        try {
            Optional<Review> review = this.reviewService.findReviewById(reviewId);
            return new ResponseEntity<>(review, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<?> deleteReviewById(@PathVariable Long reviewId) {
        try {
            boolean isDeleted = this.reviewService.deleteReviewById(reviewId);
            if(!isDeleted) return new ResponseEntity<>("Unable to delete Review", HttpStatus.INTERNAL_SERVER_ERROR);
            return new ResponseEntity<>("Review deleted successfully", HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId, @RequestBody Review request){
        try {
            Review review = this.reviewService.updateReview(reviewId, request);
            return new ResponseEntity<>(review, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
