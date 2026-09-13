package com.example.clientsocketservice.controller;

import com.example.clientsocketservice.dto.RideRequestDto;
import com.example.clientsocketservice.dto.RideResponseDto;
import com.example.clientsocketservice.dto.RideResponseDto;
import com.example.clientsocketservice.dto.UpdateBookingRequestDto;
import com.example.clientsocketservice.dto.UpdateBookingResponseDto;
import com.example.clientsocketservice.producers.KafkaProducerService;
import com.example.uberproject_entityservice.models.BookingStatus;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@RestController
@RequestMapping("/api/socket")
public class DriverRequestController {
    private final SimpMessagingTemplate simpMessagingTemplate;

    private final RestTemplate restTemplate;

    private final KafkaProducerService kafkaProducerService;



    public DriverRequestController(SimpMessagingTemplate simpMessagingTemplate, KafkaProducerService kafkaProducerService) {
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.kafkaProducerService = kafkaProducerService;
        this.restTemplate = new RestTemplate();
    }

    @PostMapping("/newride")
    @CrossOrigin(originPatterns = "*")
    public ResponseEntity<Boolean> raiseRideRequest(@RequestBody RideRequestDto rideRequestDto) {
        System.out.println("Request for ride recieved");
        sendDriversNewRideRequest(rideRequestDto);
        System.out.println("Request complete");
        return new ResponseEntity<>(Boolean.TRUE,HttpStatus.OK);
    }


    public void sendDriversNewRideRequest(  RideRequestDto  rideRequestDto) {
       System.out.println("Executed periodic function");
       for(Long driverId:rideRequestDto.getDriverIds()){
           simpMessagingTemplate.convertAndSend("/topic/rideRequest/"+driverId,rideRequestDto);

       }


    }




    @MessageMapping("/rideResponse/{userId}")
    public synchronized  void rideResponseHandler(@DestinationVariable String userId, RideResponseDto rideResponseDto) {

        System.out.println(rideResponseDto.getResponse()+" "+userId);
        if(!rideResponseDto.getResponse()){
            System.out.println("driver rejected ride");
            return;
        }
        UpdateBookingRequestDto updateBookingRequestDto=UpdateBookingRequestDto.builder()
                .driverId(Optional.of(Long.parseLong(userId)))
                .bookingStatus(BookingStatus.valueOf("SCHEDULED"))
                .build();
        System.out.println("Here fail 1");
        System.out.println("rideResponseDto.bookingId = " + rideResponseDto.getBookingId());
        System.out.println("rideResponseDto.response = " + rideResponseDto.getResponse());

        ResponseEntity<UpdateBookingResponseDto> result=this.restTemplate.postForEntity("http://localhost:7464/api/v1/booking/"+rideResponseDto.bookingId,updateBookingRequestDto,UpdateBookingResponseDto.class);
        System.out.println("Here fail 1");
        kafkaProducerService.publishMessage("sample-topic","Hello World");
        System.out.println(result.getStatusCode());
    }

}
