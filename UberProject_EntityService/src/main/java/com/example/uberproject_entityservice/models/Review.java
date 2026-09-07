package com.example.uberproject_entityservice.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="Booking_review")

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
@JsonIgnoreProperties({"hibernateLazyInitializer","handler","booking"})
public class Review extends BaseModel{


    @Column(nullable = false)
    private String content;

    private Double rating;

    @OneToOne(cascade = CascadeType.ALL,fetch=FetchType.LAZY)
    @JoinColumn(nullable = false)
     private Booking booking;


    @Override
    public String toString() {
        return "Review{" +

                ", content='" + content + '\'' +
                ", rating=" + rating +
                ", createAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
