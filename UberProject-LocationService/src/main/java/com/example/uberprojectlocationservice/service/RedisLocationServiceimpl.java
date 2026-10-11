package com.example.uberprojectlocationservice.service;

import com.example.uberprojectlocationservice.dtos.DriverLocationDto;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.GeoOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RedisLocationServiceimpl implements LocationService{

    private final StringRedisTemplate stringRedisTemplate;

    private static final String DRIVER_GEO_OPS_KEY="drivers";

    private static  final String DRIVER_ONLINE_SET_KEY="drivers:online";

    private static final Double SEARCH_RADIUS=100.0;

    public RedisLocationServiceimpl(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate=stringRedisTemplate; 
    }
    @Override
    public Boolean saveDriverLocation(String drivarId, Double latitude, Double longitude) {
        GeoOperations<String,String> geoOps=stringRedisTemplate.opsForGeo();
        geoOps.add(DRIVER_GEO_OPS_KEY,
                new RedisGeoCommands.GeoLocation<>(
                        drivarId,
                        new Point(
                                latitude,longitude)));
        stringRedisTemplate.opsForSet().add(DRIVER_ONLINE_SET_KEY,drivarId);
        return true;
    }

    @Override
    public Boolean removeDriverLocation(String driverId){
        stringRedisTemplate.opsForZSet().remove(DRIVER_GEO_OPS_KEY,driverId);
        stringRedisTemplate.opsForSet().remove(DRIVER_ONLINE_SET_KEY,driverId);
        return true;
    }

    @Override
    public List<DriverLocationDto> getNearByDrivers(Double latitude, Double longitude) {
        GeoOperations<String,String> geoOps=stringRedisTemplate.opsForGeo();

        Distance radius=new Distance(SEARCH_RADIUS, Metrics.KILOMETERS);

        Circle within=new Circle(new Point( latitude,longitude), radius);

        GeoResults<RedisGeoCommands.GeoLocation<String>> results=geoOps.radius(DRIVER_GEO_OPS_KEY,within); //this finds driver in circle within
        List<DriverLocationDto> drivers=new ArrayList<>();

        if (results == null) {
            return drivers;
        }

        for(GeoResult<RedisGeoCommands.GeoLocation<String>> res:results){
            String driverId=res.getContent().getName();

            Boolean isOnline=stringRedisTemplate.opsForSet().isMember(DRIVER_ONLINE_SET_KEY,driverId);

            if(Boolean.TRUE.equals(isOnline)){
                List<Point> points = geoOps.position(DRIVER_GEO_OPS_KEY, res.getContent().getName());
                if (points != null && !points.isEmpty() && points.get(0) != null) {
                    Point point = points.get(0);
                    DriverLocationDto driverLocation=DriverLocationDto.builder()
                            .driverId(res.getContent().getName())
                            .latitude(point.getX())
                            .longitude(point.getY()).build();
                    drivers.add(driverLocation);
                }

            }


        }
        return drivers;
    }
}
