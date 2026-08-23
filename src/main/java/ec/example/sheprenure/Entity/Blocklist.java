package ec.example.sheprenure.Entity;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;

import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Blocklist {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int id;

    private String token;
    private Instant expirey;
    
}
