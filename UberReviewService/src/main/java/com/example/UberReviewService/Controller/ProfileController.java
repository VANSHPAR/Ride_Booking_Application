package com.example.UberReviewService.Controller;

import com.example.UberReviewService.Services.ProfileService;
import com.example.UberReviewService.dtos.DriverAvailabilityDto;
import com.example.UberReviewService.dtos.DriverUpdateDto;
import com.example.UberReviewService.dtos.PassengerUpdateDto;
import com.example.UberReviewService.dtos.Simplebody;
import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import com.example.uberproject_entityservice.models.Review;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.StreamingHttpOutputMessage;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/profile")

public class ProfileController {
    private final ProfileService profileService;


    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/passenger")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<?> findPassengerByEmail(Authentication authentication){
        String email=authentication.getName();
       Optional<Passenger> passenger=this.profileService.findPassengerByEmail(email);
        if (passenger.isPresent()) {
            return new ResponseEntity<>(passenger.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Passenger not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/driver")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> findDriverByEmail(Authentication authentication){
        String email=authentication.getName();
        try {
            Optional<Driver> review = this.profileService.findDriverByEmail(email);
            return new ResponseEntity<>(review, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/passenger")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<?> updatePassenger(Authentication authentication,PassengerUpdateDto passengerUpdateDto){
        String email=authentication.getName();
        return new ResponseEntity<>(profileService.updatePassenger(email,passengerUpdateDto),HttpStatus.OK);
    }

    @PutMapping("/driver")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> updateDriver(Authentication authentication,@RequestBody DriverUpdateDto driverUpdateDto){
        String email=authentication.getName();
        return new ResponseEntity<>(profileService.updateDriver(email,driverUpdateDto),HttpStatus.OK);
    }

    @PutMapping("/driver/availability")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<String> updateAvailability(Authentication authentication, @RequestBody DriverAvailabilityDto driverAvailabilityDto){
        String email=authentication.getName();
        profileService.updateAvailability(email,driverAvailabilityDto);
        return  new ResponseEntity<>("Your Availability Changed",HttpStatus.OK);
    }
    
}
