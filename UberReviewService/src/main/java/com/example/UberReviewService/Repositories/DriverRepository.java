package com.example.UberReviewService.Repositories;


import com.example.uberproject_entityservice.models.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver,Long> {


  Optional<Driver> findByIdAndLicenseNumber(Long id, String licenseNumber);
  List<Driver> findAllByIdIn(List<Long> drivers);

//  @Query(nativeQuery = true, value="Select * from Driver where id=:id and license_number=:license")
//  //in raw sql query the name of attributes is must be same as attribute name in table,and it throws error in runime
//  Optional<Driver> rawfindByIdAndLicenseNumber(Long id,String license);
//
//  @Query("Select d from Driver d where d.id= :id And d.licenseNumber= :license")
//  //In hibernate it is not necessary to name attribute is same as attribute name in table and it throws error in compile time
//  Optional<Driver> hqlFindByIdAndLicense(Long id,String license);


}
