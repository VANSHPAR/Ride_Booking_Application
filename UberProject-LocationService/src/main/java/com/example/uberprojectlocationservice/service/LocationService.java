package com.example.uberprojectlocationservice.service;

import com.example.uberprojectlocationservice.dtos.DriverLocationDto;
import org.springframework.stereotype.Service;

import java.util.List;


public interface LocationService {

    Boolean saveDriverLocation(String drivarId,Double latitude,Double longitude);

    List<DriverLocationDto> getNearByDrivers(Double latitude,Double longitude);
}
