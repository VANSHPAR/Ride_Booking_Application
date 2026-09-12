package com.example.uberbookingservice.services;


import com.example.uberbookingservice.dto.*;
import com.example.uberproject_entityservice.models.Booking;

import java.util.List;

public interface BookingService {

    public CreateBookingResponseDto createBooking(CreateBooikngDto createBooikngDto);

    public UpdateBookingResponseDto updateBooking(UpdateBookingRequestDto updateBookingRequestDto,Long bookingId);

    public List<BookingResponseDto> getPassengerBookings(String passengerEmail);
    public List<DriverBookingResponseDto> getDriverBookings(String driverEmail);
    public UpdateBookingResponseDto cancelBooking(Long bookingId,String passengerEmail);
}
