package com.example.UberReviewService.Services;

import com.example.UberReviewService.dtos.DriverAvailabilityDto;
import com.example.UberReviewService.dtos.DriverUpdateDto;
import com.example.UberReviewService.dtos.PassengerUpdateDto;
import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public interface ProfileService {
   public Optional<Passenger> findPassengerByEmail(String email);

   public Optional<Driver> findDriverByEmail(String email);

   public Passenger updatePassenger(String email, PassengerUpdateDto passenger);

   public  Driver updateDriver(String email, DriverUpdateDto driver);

   public void updateAvailability(String email, DriverAvailabilityDto driverAvailabilityDto);

}
