package com.example.uberprojectlocationservice.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyDriverRequestDto {
    Double latitude;
    Double longitude;
}
