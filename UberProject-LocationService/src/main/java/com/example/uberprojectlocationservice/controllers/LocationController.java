package com.example.uberprojectlocationservice.controllers;

import com.example.uberprojectlocationservice.dtos.DriverLocationDto;
import com.example.uberprojectlocationservice.dtos.NearbyDriverRequestDto;
import com.example.uberprojectlocationservice.dtos.SaveDriverLocationRequestDto;

import com.example.uberprojectlocationservice.service.LocationService;
import com.example.uberprojectlocationservice.service.RedisLocationServiceimpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/location")

public class LocationController {


  private LocationService locationService;

    public LocationController(LocationService locationService) {
       this.locationService=locationService;
    }
    @PostMapping("/drivers")
    public ResponseEntity<Boolean> saveDriverLocation(@RequestBody SaveDriverLocationRequestDto saveDriverLocationRequestDto) {
        try{
            Boolean response=locationService.saveDriverLocation(saveDriverLocationRequestDto.getDriverId(),saveDriverLocationRequestDto.getLatitude(),saveDriverLocationRequestDto.getLongitude());


            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        catch(Exception e) {
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PostMapping("/nearby/drivers")
    public ResponseEntity<List<DriverLocationDto>> getNearbyDrivers(@RequestBody NearbyDriverRequestDto nearbyDriverRequestDto){
        System.out.println(nearbyDriverRequestDto.getLatitude()+" "+nearbyDriverRequestDto.getLongitude());
        try{
           List<DriverLocationDto> drivers=locationService.getNearByDrivers(nearbyDriverRequestDto.getLatitude(),nearbyDriverRequestDto.getLongitude());
            return new ResponseEntity<>(drivers, HttpStatus.OK);
        }
        catch(Exception e) {
            System.out.println(e.getMessage());
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
