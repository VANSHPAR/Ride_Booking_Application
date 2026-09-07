package com.example.clientsocketservice.dto;

import com.example.uberproject_entityservice.models.BookingStatus;
import com.example.uberproject_entityservice.models.Driver;
import lombok.*;

import java.util.Optional;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingResponseDto {


    private Long bookingId;
    private BookingStatus bookingStatus;
    private Optional<Long> driverId;


}
