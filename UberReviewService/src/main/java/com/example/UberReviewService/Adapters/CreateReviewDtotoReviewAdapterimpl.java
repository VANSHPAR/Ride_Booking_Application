package com.example.UberReviewService.Adapters;

import com.example.UberReviewService.Repositories.BookingRepository;
import com.example.UberReviewService.dtos.CreateReviewDto;

import com.example.uberproject_entityservice.models.Booking;
import com.example.uberproject_entityservice.models.Review;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CreateReviewDtotoReviewAdapterimpl implements CreateReviewDtotoReviewAdapter {

   private BookingRepository bookingRepository;

   public CreateReviewDtotoReviewAdapterimpl(BookingRepository bookingRepository) {
       this.bookingRepository = bookingRepository;
   }

    @Override
    public Review convertDto(CreateReviewDto createReviewDto) {
        Optional<Booking> booking= bookingRepository.findById(createReviewDto.getBookingId());
        if(!booking.isPresent()){
            return null;
        }
        Review review=Review.builder()
                .rating(createReviewDto.getRating())
                .booking(booking.get())
                .content(createReviewDto.getContent())
                .build();
       return review;
    }
}
