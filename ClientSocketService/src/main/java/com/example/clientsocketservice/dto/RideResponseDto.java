package com.example.clientsocketservice.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideResponseDto {
    public Long bookingId;
    public Boolean response;


}
