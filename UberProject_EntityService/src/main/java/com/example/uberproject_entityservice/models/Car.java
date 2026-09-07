package com.example.uberproject_entityservice.models;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Car extends BaseModel{
    @Column(unique = true,nullable = false)
    private String platNumber;

    @ManyToOne
    private Color color;

    private String brand;

    private String model;


    @Enumerated(EnumType.STRING)
    private Cartype cartype;

    @OneToOne
    public Driver driver;


}
