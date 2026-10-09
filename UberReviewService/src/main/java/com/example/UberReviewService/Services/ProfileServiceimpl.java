package com.example.UberReviewService.Services;

import com.example.UberReviewService.Repositories.DriverRepository;
import com.example.UberReviewService.Repositories.PassengerRepository;
import com.example.UberReviewService.dtos.*;
import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import com.example.uberproject_entityservice.models.Review;
import jakarta.persistence.EntityNotFoundException;
import org.hibernate.FetchNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileServiceimpl implements  ProfileService{

    private final DriverRepository driverRepository;

    private final PassengerRepository passengerRepository;

    public ProfileServiceimpl(DriverRepository driverRepository, PassengerRepository passengerRepository) {
        this.driverRepository = driverRepository;
        this.passengerRepository = passengerRepository;
    }

    @Override
    public PassengerResponseDto findPassengerByEmail(String email){
        Passenger passenger=passengerRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("passenger not found"));
        return  PassengerResponseDto.builder()
                .id(passenger.getId())
                .email(passenger.getEmail())
                .name(passenger.getName())
                .phoneNumber(passenger.getPhoneNumber())
                .home(passenger.getHome())
                .lastKnownLocation(passenger.getLastKnownLocation())
                .build();

    }
    @Override
    public DriverResponseDto findDriverByEmail(String email){

        Driver driver = driverRepository.findByEmail(email) .orElseThrow(() -> new RuntimeException("Driver not found"));
        return DriverResponseDto.builder()
                .id(driver.getId())
                .email(driver.getEmail())
                .name(driver.getName())
                .licenseNumber(driver.getLicenseNumber())
                .phoneNumber(driver.getPhoneNumber())
                .rating(driver.getRating())
                .home(driver.getHome())
                .lastKnownLocation(driver.getLastKnownLocation())
                .aadharNumber(driver.getAadharNumber())
                .activeCity(driver.getActiveCity())
                .isAvailable(driver.isAvailable()).build();


    }

    @Override
    public DriverResponseDto updateDriver(String email, DriverUpdateDto driver){
        Driver d=driverRepository.findByEmail(email). orElseThrow(EntityNotFoundException::new);
        if(driver.getAadharNumber()!=null) d.setAadharNumber(driver.getAadharNumber());

        if(driver.getRating()!=null) d.setRating(driver.getRating());
        if(driver.getActiveCity()!=null) d.setActiveCity(driver.getActiveCity());
        if(driver.getLicenseNumber()!=null) d.setLicenseNumber(driver.getLicenseNumber());
        if(driver.getLastKnownLocation()!=null) d.setLicenseNumber(driver.getLicenseNumber());
        if(driver.getHome()!=null) d.setHome(driver.getHome());
        if(driver.getName()!=null) d.setName(driver.getName());
        Driver driver1=driverRepository.save(d);

        return DriverResponseDto.builder()
                .id(driver1.getId())
                .email(driver1.getEmail())
                .name(driver1.getName())
                .licenseNumber(driver1.getLicenseNumber())
                .phoneNumber(driver1.getPhoneNumber())
                .rating(driver1.getRating())
                .home(driver1.getHome())
                .lastKnownLocation(driver1.getLastKnownLocation())
                .aadharNumber(driver1.getAadharNumber())
                .activeCity(driver1.getActiveCity())
                .isAvailable(driver1.isAvailable()).build();



    }

    @Override
    public PassengerResponseDto updatePassenger(String email, PassengerUpdateDto passenger){
        Passenger p=passengerRepository.findByEmail(email).orElseThrow(EntityNotFoundException::new);
        if(passenger.getLastKnownLocation()!=null) p.setLastKnownLocation(passenger.getLastKnownLocation());

        if(passenger.getRating()!=null) p.setRating(passenger.getRating());
        if(passenger.getHome()!=null)p.setHome(passenger.getHome());
        if(passenger.getName()!=null) p.setName(passenger.getName());
        Passenger passenger1 =passengerRepository.save(p);
        return  PassengerResponseDto.builder()
                .id(passenger1.getId())
                .email(passenger1.getEmail())
                .name(passenger1.getName())
                .phoneNumber(passenger1.getPhoneNumber())
                .home(passenger1.getHome())
                .lastKnownLocation(passenger1.getLastKnownLocation())
                .build();
    }
    @Override
    public void updateAvailability(String email, DriverAvailabilityDto driverAvailabilityDto){
        Driver d=driverRepository.findByEmail(email). orElseThrow(EntityNotFoundException::new);
        if(driverAvailabilityDto.isAvailable) d.setAvailable(Boolean.TRUE);

        else d.setAvailable(Boolean.FALSE);

    }
}
