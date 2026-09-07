package com.example.uberproject_entityservice.models;



import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Passenger extends BaseModel {
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

     @OneToMany(mappedBy = "passenger")
    private List<Booking> bookings=new ArrayList<>();

     @OneToOne
    private Booking activeBooking;

    @DecimalMin(value = "0.00",message = "Rating must be greater than or equal to 0.00")
    @DecimalMax(value = "5.00",message = "Rating must be less than or equal to 5.00")
     private Double rating;


    @OneToOne
    private ExactLocation lastKnownLocation;

    @OneToOne
    private ExactLocation home;


}
