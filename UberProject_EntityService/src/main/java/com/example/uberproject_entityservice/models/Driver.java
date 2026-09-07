package com.example.uberproject_entityservice.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class Driver extends BaseModel {

    private  String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;


    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private DriverApprovalStatus driverApprovalStatus;

    @OneToOne
    private ExactLocation lastKnownLocation;

    @OneToOne
    private ExactLocation home;

    private String activeCity;

    private String aadharNumber;

    @DecimalMin(value = "0.00",message = "Rating must be greater than or equal to 0.00")
    @DecimalMax(value = "5.00",message = "Rating must be less than or equal to 5.00")
    private Double rating;


    @OneToOne(mappedBy = "driver",cascade=CascadeType.ALL)
    private Car car;

    private boolean isAvailable;



    //driver has many Bookings
    @OneToMany(mappedBy = "driver")// in Eager fetching all tables related to driver are joined tohether.
    //// Lazy fetcher is default
    @Fetch(value = FetchMode.SUBSELECT)
    private List<Booking> bookings=new ArrayList<>();


}
