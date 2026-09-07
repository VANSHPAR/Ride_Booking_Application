package com.example.uberprojectauthservice.services;

import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import com.example.uberprojectauthservice.helper.AuthDriverDetails;
import com.example.uberprojectauthservice.helper.AuthPassengerDetails;
import com.example.uberprojectauthservice.repositories.DriverRepository;
import com.example.uberprojectauthservice.repositories.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
//This class is responsible for loading the passenger in the form of userdetails obj. for auth
@Service
public class UserDetailsServiceimpl implements UserDetailsService {
   @Autowired
    private  PassengerRepository passengerRepository;

   @Autowired
   private DriverRepository driverRepository;



    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Passenger> passenger=passengerRepository.findPassengerByEmail(email);
        Optional<Driver> driver=driverRepository.findDriverByEmail(email);
        if(passenger.isPresent()){
            return new AuthPassengerDetails(passenger.get());
        } else if (driver.isPresent()) {
            return new AuthDriverDetails(driver.get());

        } else{
            throw new UsernameNotFoundException("Can't find the Passenger by given Email");
        }
    }
}
