package com.example.uberbookingservice.services;

import com.example.uberbookingservice.Repositories.BookingRepository;
import com.example.uberbookingservice.Repositories.DriverRepository;
import com.example.uberbookingservice.Repositories.PassengerRepository;
import com.example.uberbookingservice.apis.LocationServiceApi;
import com.example.uberbookingservice.apis.UberSocketApi;
import com.example.uberbookingservice.dto.*;
import com.example.uberbookingservice.dto.BookingResponseDto;
import com.example.uberproject_entityservice.models.Booking;
import com.example.uberproject_entityservice.models.BookingStatus;
import com.example.uberproject_entityservice.models.Driver;
import com.example.uberproject_entityservice.models.Passenger;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class BookingServiceimpl implements BookingService{


    private final PassengerRepository passengerRepository;
    private final BookingRepository bookingRepository;


    private  final RestTemplate restTemplate;

    private final LocationServiceApi locationServiceApi;
    private final DriverRepository driverRepository;
    private final UberSocketApi uberSocketApi;


    //  private static  final String LOCATION_SERVICE="http://localhost:8080";

    public BookingServiceimpl(PassengerRepository passengerRepository, BookingRepository bookingRepository, LocationServiceApi locationServiceApi, DriverRepository driverRepository, UberSocketApi uberSocketApi) {
        this.passengerRepository = passengerRepository;
        this.bookingRepository = bookingRepository;
        this.locationServiceApi = locationServiceApi;
        this.uberSocketApi = uberSocketApi;

        this.restTemplate = new RestTemplate();
        this.driverRepository = driverRepository;
    }

    @Override
    public CreateBookingResponseDto createBooking(CreateBooikngDto createBooikngDto) {
        Optional<Passenger> passenger=passengerRepository.findById(createBooikngDto.getPassengerId());
        Booking  booking = Booking.builder()
                .bookingStatus(BookingStatus.ASSIGNING_DRIVER)
                .startLocation(createBooikngDto.getStartLocation())
                .passenger(passenger.get())
                .build();
        Booking newBooking=bookingRepository.save(booking);

        //make an api call to location service to fetch nearby drivers
        NearbyDriverRequestDto request= NearbyDriverRequestDto.builder()
                .latitude(createBooikngDto.getStartLocation().getLatitude())
                .longitude(createBooikngDto.getStartLocation().getLongitude())
                .build();
        System.out.println(request.getLatitude()+" "+request.getLongitude());
        processNearByDriversAsync(request,createBooikngDto.getPassengerId(),newBooking.getId());

//
//        ResponseEntity<DriverLocationDto[]> result = restTemplate.postForEntity(LOCATION_SERVICE+"/api/location/nearby/drivers",request,DriverLocationDto[].class);
//
//        if(result.getStatusCode().is2xxSuccessful() && result.getBody().length>0){
//            List<DriverLocationDto> driverLocations= Arrays.asList(result.getBody());
//            driverLocations.forEach(driverLocation->{
//                System.out.println(driverLocation.getDriverId()+" "+driverLocation.getLatitude()+" "+driverLocation.getLongitude());
//            });
//        }

        return CreateBookingResponseDto.builder()
                .bookingId(newBooking.getId())
                .bookingStatus(newBooking.getBookingStatus().toString())
               .build();
    }

    @Override
    public UpdateBookingResponseDto updateBooking(UpdateBookingRequestDto updateBookingRequestDto, Long bookingId) {

        Long driverId = updateBookingRequestDto.getDriverId()
                .orElseThrow(() -> new IllegalArgumentException("DriverId is missing"));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new NoSuchElementException("Driver not found with id: " + driverId));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found with id: " + bookingId));
        if(booking.getBookingStatus()==BookingStatus.SCHEDULED) {
            throw new RuntimeException("Booking is already SCHEDULED.");
        }

        bookingRepository.updateBookingStatusAndDriverById(
                bookingId, BookingStatus.SCHEDULED, driver);

        return UpdateBookingResponseDto.builder()
                .bookingId(bookingId)
                .bookingStatus(booking.getBookingStatus())
                .driverId(Optional.ofNullable(driver.getId()))
                .build();


    }

    private void processNearByDriversAsync(NearbyDriverRequestDto requestDto,Long passengerId,Long bookingId) {
        Call<DriverLocationDto[]> call=locationServiceApi.getNearbyDrivers(requestDto);

        System.out.println(call.request().url() + " " + call.request().method() + " " + call.request().headers());
        call.enqueue(new  Callback<DriverLocationDto[]>() {
            @Override
            public void onResponse(Call<DriverLocationDto[]> call, Response<DriverLocationDto[]> response) {
                System.out.println(Arrays.toString(response.body()));
            if(response.isSuccessful() && response.body()!=null){
            List<DriverLocationDto> driverLocations= Arrays.asList(response.body());
//            driverLocations.forEach(driverLocationDto->{
//                System.out.println(driverLocationDto.getDriverId()+" "+driverLocationDto.getLatitude()+" "+driverLocationDto.getLongitude());
//            });
                List<Long> driverIds=driverLocations.stream()
                        .map(DriverLocationDto::getDriverId)
                        .map(Long::parseLong).toList();
                try {
//                    raiseRideRequestAsync(RideRequestDto.builder().passengerId(passengerId).bookingId(bookingId).build());
                    raiseRideRequestAsync(RideRequestDto.builder().passengerId(passengerId).bookingId(bookingId).driverIds(driverIds).build());
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
            else System.out.println("that Request failed "+response.message());
            }

            @Override
            public void onFailure(Call<DriverLocationDto[]> call, Throwable throwable) {
                throwable.printStackTrace();
            }
        });
    }

           private void raiseRideRequestAsync(RideRequestDto rideRequestDto) throws Exception {
        Call<Boolean> call=uberSocketApi.raiseRideRequest(rideRequestDto);
               System.out.println(call.request().url() + " " + call.request().method() + " " + call.request().headers());
        call.enqueue(new Callback<>() {
            @Override
            public void onResponse(Call<Boolean> call, Response<Boolean> response) {
                System.out.println(response.isSuccessful());
                System.out.println(response.message());
                if(response.isSuccessful() && response.body()!=null){
                   Boolean result=response.body();
                    System.out.println("Driver response id "+result.toString());


                }
                else System.out.println("this  Request failed"+response.message());
            }

            @Override
            public void onFailure(Call<Boolean> call, Throwable throwable) {
                throwable.printStackTrace();
            }
        });

           }


    @Override
    public List<BookingResponseDto> getPassengerBookings(String passengerEmail) {
        List<Booking> bookings =bookingRepository.getByPassengerEmail(passengerEmail);

        return bookings.stream()
                .map(booking -> BookingResponseDto.builder()
                        .bookingId(booking.getId())
                        .bookingStatus(booking.getBookingStatus())
                        .startLocation(booking.getStartLocation())
                        .endLocation(booking.getEndLocation())
                        .driverId(booking.getDriver() != null ? booking.getDriver().getId() : null)
                        .totalDistance(booking.getTotalDistance())
                        .startTime(booking.getStartTime())
                        .endTime(booking.getEndTime())
                        .build())
                .toList();
    }
    @Override
    public List<DriverBookingResponseDto> getDriverBookings(String driverEmail){
        List<Booking> bookings=bookingRepository.getByDriverEmail(driverEmail);

        return bookings.stream()
                .map(booking -> DriverBookingResponseDto.builder()
                        .bookingId(booking.getId())
                        .bookingStatus(booking.getBookingStatus())
                        .startLocation(booking.getStartLocation())
                        .endLocation(booking.getEndLocation())
                        .passengerId(booking.getPassenger()!=null ? booking.getPassenger().getId() : null)
                        .totalDistance(booking.getTotalDistance())
                        .startTime(booking.getStartTime())
                        .endTime(booking.getEndTime())
                        .build()).toList();


    }
    @Override
    public UpdateBookingResponseDto cancelBooking(Long bookingId,String passengerEmail){
        Booking booking=bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if(!booking.getPassenger().getEmail().equals(passengerEmail)) {
            throw  new RuntimeException("Not allowed");
        }
        if(booking.getBookingStatus()==BookingStatus.ASSIGNING_DRIVER || booking.getBookingStatus()==BookingStatus.SCHEDULED || booking.getBookingStatus()==BookingStatus.CAB_ARRIVED){
            booking.setBookingStatus(BookingStatus.CANCELLED);
            Booking saveBooking=bookingRepository.save(booking);
            return UpdateBookingResponseDto.builder().bookingId(saveBooking.getId()).bookingStatus(saveBooking.getBookingStatus()).driverId(Optional.ofNullable(saveBooking.getDriver().getId())).build();
        }
        else throw new RuntimeException("You can't cancel booking.");
    }
}


