package com.example.clientsocketservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@EntityScan("com.example.uberproject_entityservice.models")
public class ClientSocketServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClientSocketServiceApplication.class, args);
    }

}
