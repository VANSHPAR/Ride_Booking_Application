package com.example.uberbookingservice.dto;

import com.example.uberproject_entityservice.models.BookingStatus;
import lombok.*;

import java.util.Optional;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingRequestDto {

    private BookingStatus bookingStatus;
    private Optional<Long> driverId;
}
