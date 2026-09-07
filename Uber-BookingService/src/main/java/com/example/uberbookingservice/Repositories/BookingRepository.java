package com.example.uberbookingservice.Repositories;

import com.example.uberproject_entityservice.models.Booking;
import com.example.uberproject_entityservice.models.BookingStatus;
import com.example.uberproject_entityservice.models.Driver;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
     @Modifying
     @Transactional
    @Query("UPDATE Booking b SET b.bookingStatus=:status , b.driver=:driver where b.id=:id")
   void updateBookingStatusAndDriverById(@Param("id") Long id, @Param("status") BookingStatus status, @Param("driver") Driver driver);
}
