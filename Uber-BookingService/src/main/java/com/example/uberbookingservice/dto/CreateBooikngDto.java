package com.example.uberbookingservice.dto;

import com.example.uberproject_entityservice.models.ExactLocation;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateBooikngDto {

    private Long passengerId;

    private ExactLocation startLocation;

    private ExactLocation endLocation;
}
