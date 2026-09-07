package com.example.uberprojectauthservice.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService  {

    @Value("${jwt.expiry}")
    private int expiry;

    @Value("${jwt.secret}")
    private  String SECRET;

    //this method create token based on payload
    public String createToken(Map<String, Object> payload, String email) {
        Date  now = new Date();
        Date expiryDate = new Date(now.getTime() + expiry*1000L);

        return Jwts.builder()
                .claims(payload)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(expiryDate)
                .subject(email)
                .signWith(getSignKey())
                .compact();

    }
    public String createToken(String email){
        return createToken(new HashMap<>(),email);
    }
    public String createToken(String email,String role){
        Map<String,Object> claims=new HashMap<>();
        claims.put("role",role);
        return createToken(claims,email);
    }
//
//    private <T> T extractPayload(String token, Function<Claims, T> resolverFunction) {
//        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
//        final claims = Jwts.parser().decryptWith(key).build().parseClaimsJws(token).getPayload();
//    }

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
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
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
