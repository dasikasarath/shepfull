package ec.example.sheprenure.dto;

import lombok.Data;

@Data
public class VerifyEmailOtpDto {
    private String email;
    private String otp;
}
