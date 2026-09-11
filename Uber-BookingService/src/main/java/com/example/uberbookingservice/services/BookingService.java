package com.example.uberbookingservice.services;


import com.example.uberbookingservice.dto.CreateBooikngDto;
import com.example.uberbookingservice.dto.CreateBookingResponseDto;
import com.example.uberbookingservice.dto.UpdateBookingRequestDto;
import com.example.uberbookingservice.dto.UpdateBookingResponseDto;
import com.example.uberproject_entityservice.models.Booking;

import java.util.List;

public interface BookingService {

    public CreateBookingResponseDto createBooking(CreateBooikngDto createBooikngDto);

    public UpdateBookingResponseDto updateBooking(UpdateBookingRequestDto updateBookingRequestDto,Long bookingId);

}
