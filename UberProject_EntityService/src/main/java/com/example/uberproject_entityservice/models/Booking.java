package com.example.uberproject_entityservice.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
//@Table(indexes = {
//        @Index(columnList = "driver_id")
//})
public class Booking extends BaseModel{

    @Enumerated(value= EnumType.STRING) //to specify  BookingStatus is enum we use @Enumerated and it gives facility->if you want to store this enum as number or as string
    private BookingStatus bookingStatus;

    @Temporal(value= TemporalType.TIMESTAMP)
    private Date startTime;

    @Temporal(value= TemporalType.TIMESTAMP)
    private Date endTime;

    private Long totalDistance;

    //Booking has one Driver
    @ManyToOne(fetch=FetchType.LAZY)
    private Driver driver;

    @ManyToOne(fetch=FetchType.LAZY)
    private Passenger passenger;

    @OneToOne(cascade = CascadeType.ALL)
    private ExactLocation startLocation;

    @OneToOne(cascade = CascadeType.ALL)
    private ExactLocation endLocation;


}
