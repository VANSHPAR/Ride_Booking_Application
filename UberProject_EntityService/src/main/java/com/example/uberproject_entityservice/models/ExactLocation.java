package com.example.uberproject_entityservice.models;

import jakarta.persistence.Entity;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExactLocation  extends BaseModel{
    private Double latitude;
    private Double longitude;
}
