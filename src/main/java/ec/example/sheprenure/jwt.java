package ec.example.sheprenure;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import java.util.*;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import ec.example.sheprenure.Entity.UserEntity;


@Component
public class jwt {
  private SecretKey k;

  @Value("${jwt.secret}")
  private String secretkey;

  @PostConstruct
  public void hi(){
  k=Keys.hmacShaKeyFor(secretkey.getBytes());
  }

  public String generateToken(UserEntity dbobj) {
    var builder = Jwts.builder()
               .subject(dbobj.getName())
               .claim("id", dbobj.getUserId())
               .claim("role", dbobj.getRole())
               .issuedAt(new Date())
               .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24))
               .signWith(k);

    if (dbobj.getEmail() != null && !dbobj.getEmail().isBlank()) {
        builder.claim("email", dbobj.getEmail());
    }

    return builder.compact();
  }

  public  String extractUserName(String token){

    return Jwts.parser()
               .verifyWith(k)
               .build()
               .parseSignedClaims(token)
               .getPayload()
               .getSubject();
               
  }


  public int extractId(String token) {
      try {
          Object val = Jwts.parser()
                     .verifyWith(k)
                     .build()
                     .parseSignedClaims(token)
                     .getPayload()
                     .get("id");
          if (val instanceof Number) {
              return ((Number) val).intValue();
          }
          if (val instanceof String) {
              return Integer.parseInt((String) val);
          }
      } catch (Exception e) {
          // If token has no valid id, return -1
      }
      return -1;
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
               .verifyWith(k)
               .build()
               .parseSignedClaims(token)
               .getPayload()
               .getExpiration();
  }

  public String ExtractRole(String token){
    return Jwts.parser()
        .verifyWith(k)
        .build()
        .parseSignedClaims(token)
        .getPayload()
        .get("role",String.class);
  }

  public String extractEmail(String token) {
      try {
          return Jwts.parser()
                     .verifyWith(k)
                     .build()
                     .parseSignedClaims(token)
                     .getPayload()
                     .get("email", String.class);
      } catch (Exception e) {
          return null;
      }
  }

}
