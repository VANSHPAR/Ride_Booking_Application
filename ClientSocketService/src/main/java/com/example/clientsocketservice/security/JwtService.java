package com.example.clientsocketservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService  {



    @Value("${jwt.secret}")
    private  String SECRET;


    public Claims getAllPayloads(String token) {
        return Jwts.parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllPayloads(token);
        return claimsResolver.apply(claims);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token){
        return extractClaim(token,claims -> claims.get("role", String.class));
    }
    //This method checks if the token expiry was before the current timestamp or not.
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Key getSignKey(){

        byte[] bytes= Decoders.BASE64.decode(SECRET);

        return Keys.hmacShaKeyFor(bytes);
    }

    public Boolean validateToken(String token,String email) {
        final String userEmailFetchedFromToken=extractEmail(token);
        return (userEmailFetchedFromToken.equals(email)) && !isTokenExpired(token);
    }

    public String extractPhoneNumber(String token) {
        Claims claims = getAllPayloads(token);
        String ph=claims.get("phoneNumber", String.class);
        return ph;
    }

//    @Override
//    public void run(String... args) throws Exception {
//        Map<String,Object> mp= new HashMap<>();
//        mp.put("email","person@gmail.com");
//        mp.put("phoneNumber","9798554345");
//
//        String result=createToken(mp,"person@gmail.com");
//
//        System.out.println("Generated token is: "+result);
//       // System.out.println(extractPhoneNumber(result));
//        System.out.println(validateToken(result,"person@gmail.com"));
//    }
}