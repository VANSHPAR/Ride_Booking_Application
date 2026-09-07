package com.example.clientsocketservice.consumers;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService1 {


    @KafkaListener(topics = "sample-topic",groupId = "sample-group-2")
    public void listen(String message)
    {
        System.out.println("kafka consumer new  message from sample topic "+message);
    }
}
