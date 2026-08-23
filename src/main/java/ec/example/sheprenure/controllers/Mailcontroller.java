package ec.example.sheprenure.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.RestController;

import ec.example.sheprenure.Services.Forgotservice;
import ec.example.sheprenure.dto.PasswordsetDto;
import ec.example.sheprenure.dto.VerifyotpDto;
import jakarta.mail.internet.MimeMessage;

import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import ec.example.sheprenure.Services.*;

// both admin and user need to provide access
@RestController
@RequestMapping("/forgotpassword")
public class Mailcontroller {
    
    @Autowired
    private Forgotservice fs;

    @PostMapping("/generateotp/{name}")
    public String postMethodGenstore(@PathVariable String name) {
        
        return fs.getGenerateOTP(name);
    }
    

    @PostMapping("/verify")
    public String postMethodName(@RequestBody VerifyotpDto verifyy) {
        
        
        return fs.verifyotp(verifyy);
    }
    
    @PatchMapping("/passwordchange")
    public String settpass(@RequestBody PasswordsetDto passobj){
        return fs.setPassword(passobj);
    }
}
