package com.example.uberbookingservice.controllers;

import com.example.uberbookingservice.dto.*;
import com.example.uberbookingservice.services.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/booking")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<CreateBookingResponseDto> createBooking(@RequestBody CreateBooikngDto createBooikngDto) throws IOException {

        return new ResponseEntity<>(bookingService.createBooking(createBooikngDto), HttpStatus.CREATED);
    }

    @PostMapping("/{bookingId}")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<UpdateBookingResponseDto> updateBooking(@RequestBody UpdateBookingRequestDto updateBookingRequestDto, @PathVariable Long bookingId) {

        return new ResponseEntity<>(bookingService.updateBooking(updateBookingRequestDto,bookingId),HttpStatus.OK);
    }

    @GetMapping("/passenger/my-bookings")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(Authentication authentication) {
        String email = authentication.getName();
        List<BookingResponseDto> bookings = bookingService.getPassengerBookings(email);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/driver/my-bookings")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<DriverBookingResponseDto>> getDriverBookings(Authentication authentication){
        String email=authentication.getName();

        List<DriverBookingResponseDto> bookings=bookingService.getDriverBookings(email);
        return  new ResponseEntity<>(bookings,HttpStatus.OK);
    }

    @PutMapping("/{bookingId}/cancel")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<UpdateBookingResponseDto> cancelBooking(@PathVariable Long bookingId,Authentication authentication){
        String email=authentication.getName();
        UpdateBookingResponseDto res=bookingService.cancelBooking(bookingId,email);

        return new ResponseEntity<>(res,HttpStatus.OK);

    }
}
