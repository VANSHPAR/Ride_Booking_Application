package com.example.UberReviewService.Services;

import com.example.UberReviewService.dtos.*;
import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public interface ProfileService {
   public PassengerResponseDto findPassengerByEmail(String email);

   public DriverResponseDto findDriverByEmail(String email);

   public PassengerResponseDto updatePassenger(String email, PassengerUpdateDto passenger);

   public  DriverResponseDto updateDriver(String email, DriverUpdateDto driver);

   public void updateAvailability(String email, DriverAvailabilityDto driverAvailabilityDto);

}
