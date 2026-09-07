package com.example.uberbookingservice.dto;

import com.example.uberproject_entityservice.models.Driver;
import lombok.*;


import java.util.Optional;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateBookingResponseDto {

    private Long bookingId;

    private String bookingStatus;

    private Optional<Driver> driver;
}
