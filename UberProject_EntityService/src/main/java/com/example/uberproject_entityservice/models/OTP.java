package com.example.uberproject_entityservice.models;

import jakarta.persistence.Entity;
import lombok.*;

import java.util.Random;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OTP extends BaseModel{

    private String code;

    private String sentToNumber;

    public static OTP make(String phoneNumber){
        Random rand = new Random();

        Integer x=rand.nextInt(9000)+1000;

        return OTP.builder().code(x.toString()).sentToNumber(phoneNumber).build();
    }
}
