package com.example.uberbookingservice.apis;

import com.example.uberbookingservice.dto.DriverLocationDto;
import com.example.uberbookingservice.dto.NearbyDriverRequestDto;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface LocationServiceApi {

    @POST("/api/location/nearby/drivers")
    Call<DriverLocationDto[]> getNearbyDrivers(@Body NearbyDriverRequestDto requestDto);
}
