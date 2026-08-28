package ec.example.sheprenure.Services;

import java.net.http.HttpRequest;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import ec.example.sheprenure.Repository.BlocklistRepository;
import ec.example.sheprenure.Repository.RegisterOtpRepository;
import ec.example.sheprenure.Repository.UserRepository;
import ec.example.sheprenure.jwt;
import ec.example.sheprenure.Entity.Blocklist;
import ec.example.sheprenure.Entity.RegisterOtp;
import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Service //no auth needed//
public class userService {

    @Autowired
    private UserRepository urepo;

    @Autowired
    private RegisterOtpRepository regOtpRepo;

    @Autowired
    private BlocklistRepository brepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private jwt jt;

    public String logintok(UserDto obj){

        UserEntity dbobj=urepo.findByName(obj.getName()).orElse(null);


        if(dbobj!=null){

            if(dbobj.getIsVerified() != null && !dbobj.getIsVerified()){
                return "Please verify your email before logging in";
            }

            if(!obj.getPassword().equals(dbobj.getPassword())){
                return "Incorrect password";
            }
            else if(obj.getPassword().equals(dbobj.getPassword())){

                return jt.generateToken(dbobj);
            }
        }

        return "Incorrect credentials!";
    }

    public String sendRegistrationOtp(String email) {
        if (email == null || email.isBlank()) {
            return "Email is required";
        }

        Optional<UserEntity> existingUser = urepo.findByEmail(email);
        if (existingUser.isPresent()) {
            return "Email is already registered. Please sign in or use another email.";
        }

        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);

        RegisterOtp regOtp = regOtpRepo.findByEmail(email).orElse(new RegisterOtp());
        regOtp.setEmail(email);
        regOtp.setOtp(String.valueOf(otp));
        regOtp.setExp(LocalDateTime.now().plusMinutes(5));
        regOtp.setIsVerified(false);
        regOtpRepo.save(regOtp);

        System.out.println("Generated Registration OTP for " + email + ": " + otp);

        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendOtpEmail(
                        email,
                        String.valueOf(otp),
                        "Email Verification Code",
                        "Thank you for joining Sheprenure! Please use the OTP below to verify your email address.",
                        5
                );
            } catch (Exception e) {
                System.err.println("Failed to send registration email to " + email + ": " + e.getMessage());
            }
        });

        return "Verification OTP sent to your email!";
    }

    public String verifyRegistrationOtp(VerifyEmailOtpDto dto) {
        if (dto == null || dto.getEmail() == null || dto.getOtp() == null) {
            return "Email and OTP are required";
        }

        Optional<RegisterOtp> regOtpOpt = regOtpRepo.findByEmail(dto.getEmail());
        if (regOtpOpt.isEmpty()) {
            return "Please request an OTP first";
        }

        RegisterOtp regOtp = regOtpOpt.get();
        if (LocalDateTime.now().isAfter(regOtp.getExp())) {
            return "OTP has expired. Please request a new one.";
        }

        if (!regOtp.getOtp().equals(dto.getOtp().trim())) {
            return "Invalid verification OTP";
        }

        regOtp.setIsVerified(true);
        regOtpRepo.save(regOtp);
        return "Email verified successfully! You can now complete your registration.";
    }

    @Transactional
    public String postReg(UserEntity data){
        UserEntity db=urepo.findByName(data.getName()).orElse(null);
        if(db!=null){
            return "use another user name";
        }

        if (data.getEmail() == null || data.getEmail().isBlank()) {
            return "Email is required";
        }

        if (urepo.findByEmail(data.getEmail()).isPresent()) {
            return "Email is already registered";
        }

        // Verify that this email was verified via OTP
        Optional<RegisterOtp> regOtpOpt = regOtpRepo.findByEmail(data.getEmail());
        if (regOtpOpt.isEmpty() || !Boolean.TRUE.equals(regOtpOpt.get().getIsVerified())) {
            return "Please verify your email with OTP first before registration";
        }

        data.setRole("USER");
        data.setIsVerified(true);
        urepo.save(data);

        // Clean up OTP record
        regOtpRepo.deleteByEmail(data.getEmail());

        return data.getName()+"  registered successfully! of ID  "+data.getUserId();
    }


public String logout(HttpServletRequest req){
    String header=req.getHeader("Authorization");
    String token=null;
    Instant exp;

    if(header!=null && header.startsWith("Bearer ")){
        token=header.substring(7);
        exp=jt.ExtractExpir(token).toInstant();

        Blocklist b=new Blocklist();
        b.setExpirey(exp);
        b.setToken(token);
        brepo.save(b);
        return "Logged out successfully!";
    }
    return "failed to logout";

    }

    

///profiles///


public ProfileDto getProfilee(){
    Authentication det=SecurityContextHolder.getContext().getAuthentication();
      int userid=(Integer)det.getDetails();
     UserEntity ent=urepo.findById(userid).orElseThrow(()->new RuntimeException("user not existed"));
    
        ProfileDto obj=new ProfileDto();
        obj.setEmail(ent.getEmail());
        obj.setName(ent.getName());
        obj.setMobile(ent.getMobile());
        obj.setPincode(ent.getPincode());
        obj.setShippingAdd(ent.getShippingAdd());

        return obj;
     }


public String rechange(PasswordDto reqobj){
    Authentication auth=SecurityContextHolder.getContext().getAuthentication();
    int userid=(Integer) auth.getDetails();
    UserEntity dbobj=urepo.findById(userid).orElseThrow(()->new RuntimeException("failed to change"));
    if(dbobj.getPassword().equals(reqobj.getCurrpass())){
        dbobj.setPassword(reqobj.getPassword());
        urepo.save(dbobj);
        return "password changed successfully";
    }
    return "failed to change";
}

public String updateUse(UpdateProfileDto reqobj){
    Authentication auth=SecurityContextHolder.getContext().getAuthentication();
    int userid=(Integer) auth.getDetails();
     UserEntity dbobj=urepo.findById(userid).orElseThrow(()->new RuntimeException("failed to change"));
     if(reqobj.getAddress()!=null && !reqobj.getAddress().isBlank()){
        dbobj.setShippingAdd(reqobj.getAddress());
     }
     if(reqobj.getEmail()!=null && !reqobj.getEmail().isBlank()){
        dbobj.setEmail(reqobj.getEmail());
     }
     if(reqobj.getPincode()!=null && !reqobj.getPincode().isBlank()){
        dbobj.setPincode(reqobj.getPincode());
     }
     if(reqobj.getMobile()!=null && !reqobj.getMobile().isBlank()){
        dbobj.setMobile(reqobj.getMobile());
     }

     urepo.save(dbobj);

     return "updated successfully";
}


}
