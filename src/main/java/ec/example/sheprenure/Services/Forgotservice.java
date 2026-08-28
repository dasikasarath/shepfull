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
    private JavaMailSender ms;

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
    frepo.save(reobj);
}

        System.out.println("Generated Password Reset OTP for " + name + ": " + otp);
        String recipientEmail = dbuser.get().getEmail();
        CompletableFuture.runAsync(() -> {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(recipientEmail);
                msg.setSubject("SHEPRENURE PASSWORD RESET");
                msg.setText(String.valueOf(otp) + " don't share this to anyone (EXPIRES IN 3 MINS)");
                ms.send(msg);
                System.out.println("Password reset OTP email sent successfully to " + name);
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
    if(dbb.getOtp().equals(verifyy.getOtp()) && LocalDateTime.now().isBefore(dbb.getExp())){
        dbb.setIsverified(true);
        frepo.save(dbb);
        return "verification successfull now you can change the password";
    }
    return "invalid otp";
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
