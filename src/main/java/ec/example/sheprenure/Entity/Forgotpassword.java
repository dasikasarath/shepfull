package ec.example.sheprenure.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Forgotpassword {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int id;
    private String name;
    private String otp;
    private LocalDateTime exp;
    private boolean isverified;
    private int attemptCount = 0;

    public boolean getIsverified(){return isverified;}

}
