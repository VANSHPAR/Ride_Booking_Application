package com.example.clientsocketservice.consumers;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.annotation.KafkaListeners;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {


    @KafkaListener(topics = "sample-topic")
    public void listen(String message)
    {
        System.out.println("kafka message from sample topic "+message);
    }
}
