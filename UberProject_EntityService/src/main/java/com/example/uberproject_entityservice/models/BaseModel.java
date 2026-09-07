package com.example.uberproject_entityservice.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Date;
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
@Getter
@Setter
public abstract class BaseModel {  //this class have those properties which properties every class has
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Identity means auto_increment
    protected Long id;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP) //this annotation tells spring to type time
    @CreatedDate //this annotaion tells spring spring that only handle it for object creation
    protected Date createdAt;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @LastModifiedDate//this annotaion tells spring spring that only handle it for object updation
    protected Date updatedAt;
}
