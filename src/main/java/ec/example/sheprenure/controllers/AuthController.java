
package ec.example.sheprenure.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.Services.userService;

import ec.example.sheprenure.Repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import ec.example.sheprenure.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import java.net.http.HttpRequest;




@RestController

public class AuthController {




    @Autowired
    private userService userv;


    @PostMapping("/user/register/send-otp")
    public String sendRegistrationOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        return userv.sendRegistrationOtp(email);
    }

    @PostMapping("/user/register/verify-otp")
    public String verifyRegistrationOtp(@RequestBody VerifyEmailOtpDto dto) {
        return userv.verifyRegistrationOtp(dto);
    }

    @PostMapping("/user/register")
    public String postMethodName(@Valid @RequestBody UserEntity data) {
                 
         return userv.postReg(data);
    }


    

    @PostMapping("/login")
    public String postlogin(@RequestBody UserDto obj) {
    
        
        return userv.logintok(obj) ;
    }
    

    //using logout is not good because springboot has default name logout it intercept//
    @PostMapping("/logouts")
    public String postMethodlogout(HttpServletRequest req) {
        
        
        return userv.logout(req);
    }
    
    
}
