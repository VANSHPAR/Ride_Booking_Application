package com.example.uberprojectauthservice.services;

import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import com.example.uberproject_entityservice.models.Role;
import com.example.uberprojectauthservice.dto.DriverDto;
import com.example.uberprojectauthservice.dto.DriverSignuprequestDto;
import com.example.uberprojectauthservice.dto.PassengerDto;
import com.example.uberprojectauthservice.dto.PassengerSignuprequestDto;
import com.example.uberprojectauthservice.repositories.DriverRepository;
import com.example.uberprojectauthservice.repositories.PassengerRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PassengerRepository passengerRepository;

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    private final DriverRepository driverRepository;

    public AuthService(PassengerRepository passengerRepository, BCryptPasswordEncoder bCryptPasswordEncoder, DriverRepository driverRepository) {
        this.passengerRepository = passengerRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.driverRepository = driverRepository;
    }

    public PassengerDto signupPassenger(PassengerSignuprequestDto passengerSignuprequestDto){
        Passenger passenger = Passenger.builder()
                .email(passengerSignuprequestDto.getEmail())
                .name(passengerSignuprequestDto.getName())
                .password(bCryptPasswordEncoder.encode(passengerSignuprequestDto.getPassword()))
                .role(Role.PASSENGER)
                .phoneNumber(passengerSignuprequestDto.getPhoneNumber()).build();

        passengerRepository.save(passenger);
        return PassengerDto.from(passenger);

    }

    public DriverDto signupDriver(DriverSignuprequestDto driverSignuprequestDto){


        Driver driver=Driver.builder()
                .email(driverSignuprequestDto.getEmail())
                        .name(driverSignuprequestDto.getName())
                                .password(bCryptPasswordEncoder.encode(driverSignuprequestDto.getPassword()))
                                        .phoneNumber(driverSignuprequestDto.getPhoneNumber())
                                                .licenseNumber(driverSignuprequestDto.getLicenseNumber())
                                                        .role(Role.DRIVER)
                                                                .name(driverSignuprequestDto.getName()).build();

        driverRepository.save(driver);
        return DriverDto.from(driver);

    }
}
