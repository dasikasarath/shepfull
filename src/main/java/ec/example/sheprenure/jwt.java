package ec.example.sheprenure;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import java.security.*;
import java.time.Instant;
import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import ec.example.sheprenure.Entity.UserEntity;
import io.jsonwebtoken.SignatureAlgorithm;


@Component
public class jwt {
  private Key k;

  @Value("${jwt.secret}")
  private String secretkey;

  @PostConstruct
  public void hi(){
  k=Keys.hmacShaKeyFor(secretkey.getBytes());
  }

  public  String generateToken(UserEntity dbobj){
    return Jwts.builder()
               .setSubject(dbobj.getName())
               .claim("id",dbobj.getUserId())
               .claim("role", dbobj.getRole())
               .setIssuedAt(new Date())
               .setExpiration(new Date(System.currentTimeMillis()+1000*60*60))
               .signWith(k,SignatureAlgorithm.HS256)
               .compact();

  }

  public  String extractUserName(String token){

    return Jwts.parser()
               .setSigningKey(k)
               .build()
               .parseClaimsJws(token)
               .getBody()
               .getSubject();
               
  }


  public  int extractId(String token){
    return Jwts.parser()
               .setSigningKey(k)
               .build()
               .parseClaimsJws(token)
               .getBody()
               .get("id",Integer.class);
  }


  public  boolean validate(String token){
          try{
            extractUserName(token);
            return true;
          }
          catch(Exception e){
            return false;
          }
  }


  public  Date ExtractExpir(String token){
    return Jwts.parser()
               .setSigningKey(k)
               .build()
               .parseClaimsJws(token)
               .getBody()
               .getExpiration();
  }

  public  String ExtractRole(String token){
    return Jwts.parser()
        .setSigningKey(k)
        .build()
        .parseClaimsJws(token)
        .getBody()
        .get("role",String.class);
        
  }

    
}
