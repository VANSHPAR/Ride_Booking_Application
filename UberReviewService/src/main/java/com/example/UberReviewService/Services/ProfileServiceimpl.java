package com.example.UberReviewService.Services;

import com.example.UberReviewService.Repositories.DriverRepository;
import com.example.UberReviewService.Repositories.PassengerRepository;
import com.example.UberReviewService.dtos.DriverAvailabilityDto;
import com.example.UberReviewService.dtos.DriverUpdateDto;
import com.example.UberReviewService.dtos.PassengerUpdateDto;
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
    public Optional<Passenger> findPassengerByEmail(String email){
        Optional<Passenger> passenger;
        try{
            passenger=passengerRepository.findByEmail(email);
            if(passenger.isEmpty()){
                throw new EntityNotFoundException("Passenger with id " + email + " not found");

            }
        }
        catch (Exception e){
            e.printStackTrace();
            if(e.getClass() == EntityNotFoundException.class){
                throw new FetchNotFoundException("Review with id " + email + " not found",email);
            }
            throw new FetchNotFoundException("Unable to fetch, PLease try again later!", email);
        }
        return passenger;
    }
    @Override
    public Optional<Driver> findDriverByEmail(String email){
        Optional<Driver> driver;
        try{
            driver=driverRepository.findByEmail(email);
            if(driver.isEmpty()){
                throw new EntityNotFoundException("Passenger with id " + email + " not found");

            }
        }
        catch (Exception e){
            e.printStackTrace();
            if(e.getClass() == EntityNotFoundException.class){
                throw new FetchNotFoundException("Review with id " + email + " not found",email);
            }
            throw new FetchNotFoundException("Unable to fetch, PLease try again later!", email);
        }
        return driver;
    }

    @Override
    public Driver updateDriver(String email, DriverUpdateDto driver){
        Driver d=driverRepository.findByEmail(email). orElseThrow(EntityNotFoundException::new);
        if(driver.getAadharNumber()!=null) d.setAadharNumber(driver.getAadharNumber());

        if(driver.getRating()!=null) d.setRating(driver.getRating());
        if(driver.getActiveCity()!=null) d.setActiveCity(driver.getActiveCity());
        if(driver.getLicenseNumber()!=null) d.setLicenseNumber(driver.getLicenseNumber());
        if(driver.getLastKnownLocation()!=null) d.setLicenseNumber(driver.getLicenseNumber());
        if(driver.getName()!=null) d.setName(driver.getName());

        return driverRepository.save(d);
    }

    @Override
    public Passenger updatePassenger(String email, PassengerUpdateDto passenger){
        Passenger p=passengerRepository.findByEmail(email).orElseThrow(EntityNotFoundException::new);
        if(passenger.getLastKnownLocation()!=null) p.setLastKnownLocation(passenger.getLastKnownLocation());

        if(passenger.getRating()!=null) p.setRating(passenger.getRating());
        if(passenger.getHome()!=null)p.setHome(passenger.getHome());
        if(passenger.getName()!=null) p.setName(passenger.getName());
        return  passengerRepository.save(p);
    }
    @Override
    public void updateAvailability(String email, DriverAvailabilityDto driverAvailabilityDto){
        Driver d=driverRepository.findByEmail(email). orElseThrow(EntityNotFoundException::new);
        if(driverAvailabilityDto.isAvailable) d.setAvailable(Boolean.TRUE);

        else d.setAvailable(Boolean.FALSE);

    }
}
