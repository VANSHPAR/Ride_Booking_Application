package com.example.uberproject_entityservice.models;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NamedLocation extends BaseModel {
    @OneToOne
    private ExactLocation location;

    private String name;

    private String zipCode;

    private String city;

    private String state;

    private String country;
}
