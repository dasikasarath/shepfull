package ec.example.sheprenure.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private int userId;
    private String name;
    @NotBlank
    @Email
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    private String pincode;
    private String mobile;
    private String shippingAdd;
    private String role;
    private Boolean isVerified = false;

}
