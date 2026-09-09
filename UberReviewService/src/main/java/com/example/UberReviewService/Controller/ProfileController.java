package com.example.UberReviewService.Controller;

import com.example.UberReviewService.Services.ProfileService;
import com.example.UberReviewService.dtos.DriverUpdateDto;
import com.example.UberReviewService.dtos.PassengerUpdateDto;
import com.example.UberReviewService.dtos.Simplebody;
import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import com.example.uberproject_entityservice.models.Review;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.StreamingHttpOutputMessage;
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
    public ResponseEntity<?> findPassengerByEmail(@RequestBody Simplebody simplebody){
        try {
            Optional<Passenger> review = this.profileService.findPassengerByEmail(simplebody.getEmail());
            return new ResponseEntity<>(review, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/driver")
    public ResponseEntity<?> findDriverByEmail(@RequestBody Simplebody simplebody){
        try {
            Optional<Driver> review = this.profileService.findDriverByEmail(simplebody.getEmail());
            return new ResponseEntity<>(review, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/passenger")
    public ResponseEntity<?> updatePassenger(@RequestBody PassengerUpdateDto passengerUpdateDto){
        return new ResponseEntity<>(profileService.updatePassenger(passengerUpdateDto.getEmail(),passengerUpdateDto),HttpStatus.OK);
    }

    @PutMapping("/driver")
    public ResponseEntity<?> updateDriver(@RequestBody DriverUpdateDto driverUpdateDto){
        return new ResponseEntity<>(profileService.updateDriver(driverUpdateDto.getEmail(),driverUpdateDto),HttpStatus.OK);
    }
    
}
