package com.example.uberbookingservice.dto;

import com.example.uberproject_entityservice.models.BookingStatus;
import com.example.uberproject_entityservice.models.ExactLocation;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDto {

    private Long bookingId;

    private BookingStatus bookingStatus;

    private ExactLocation startLocation;

    private ExactLocation endLocation;

    private Long driverId;

    private Long totalDistance;

    private Date startTime;

    private Date endTime;
}
