package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import ec.example.sheprenure.Repository.Forgotmailrepo;
import ec.example.sheprenure.Repository.UserRepository;
import ec.example.sheprenure.dto.PasswordsetDto;
import ec.example.sheprenure.dto.VerifyotpDto;
import jakarta.transaction.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import javax.management.RuntimeErrorException;

import ec.example.sheprenure.Entity.*;

@Service  //auth not needed //
public class Forgotservice {

    @Autowired
    private UserRepository urepo;


    @Autowired
    private Forgotmailrepo frepo;

    @Autowired
    private EmailService emailService;

    public String getGenerateOTP(String name){
        int otp;

         SecureRandom random=new SecureRandom();
   otp=100000+random.nextInt(900000);

    Optional<UserEntity> dbuser=urepo.findByName(name);
  //  int userid=dbuser.get().getUserId();
    if(dbuser.isEmpty()){
        return "user not existed";
    }
    Optional<Forgotpassword> db=frepo.findByName(name);
    if(db.isEmpty()){  
   Forgotpassword sett=new Forgotpassword();
   sett.setName(name);
   sett.setOtp(String.valueOf(otp));//int generated but strong in string format//
   sett.setExp(LocalDateTime.now().plusMinutes(3));
   sett.setIsverified(false);
   frepo.save(sett);
   

    }
else{
    Forgotpassword reobj=db.get();
    reobj.setIsverified(false);
    reobj.setExp(LocalDateTime.now().plusMinutes(3));
    reobj.setOtp(String.valueOf(otp));
    reobj.setAttemptCount(0); // Reset lockout counter when a new OTP is issued
    frepo.save(reobj);
}

        System.out.println("Generated Password Reset OTP for " + name + ": " + otp);
        String recipientEmail = dbuser.get().getEmail();
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendOtpEmail(
                        recipientEmail,
                        String.valueOf(otp),
                        "Password Reset Request",
                        "We received a request to reset the password for account: <strong>" + name + "</strong>.",
                        3
                );
                System.out.println("Password reset OTP email sent successfully to " + name + " (" + recipientEmail + ")");
            } catch (Exception e) {
                System.err.println("Failed to send reset email to " + name + ": " + e.getMessage());
            }
        });

        return "message sent successfully!";


}



public String verifyotp(VerifyotpDto verifyy){
    Optional<Forgotpassword> dbobj=frepo.findByName(verifyy.getName());
    if(dbobj.isEmpty()){
        return "get otp first";
    }
    Forgotpassword dbb=dbobj.get();

    // Lock out after 5 failed attempts to prevent brute-force
    if(dbb.getAttemptCount() >= 5){
        frepo.deleteByName(verifyy.getName());
        return "Too many failed attempts. Please request a new OTP.";
    }

    if(dbb.getOtp().equals(verifyy.getOtp()) && LocalDateTime.now().isBefore(dbb.getExp())){
        dbb.setIsverified(true);
        dbb.setAttemptCount(0);
        frepo.save(dbb);
        return "verification successfull now you can change the password";
    }

    // Increment failure counter and save
    dbb.setAttemptCount(dbb.getAttemptCount() + 1);
    frepo.save(dbb);
    int remaining = 5 - dbb.getAttemptCount();
    return remaining > 0
        ? "invalid otp. " + remaining + " attempt(s) remaining."
        : "Too many failed attempts. Please request a new OTP.";
}

@Transactional
public String setPassword(PasswordsetDto passobj){
    String name=passobj.getName();
    String password=passobj.getPassword();
    Optional<Forgotpassword> ooob=frepo.findByName(name);
    if(ooob.isEmpty()){
        return "verify first";
    }
    Forgotpassword oooob=ooob.get();
    if(oooob.getIsverified() && LocalDateTime.now().isBefore(oooob.getExp())){
        Optional<UserEntity> user=urepo.findByName(name);
        user.get().setPassword(password);
        urepo.save(user.get());
        frepo.deleteByName(name);
        return "password changed successfully";
    }
   return "verification failed";
}
    
}
