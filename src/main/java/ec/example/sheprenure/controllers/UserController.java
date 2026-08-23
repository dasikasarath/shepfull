package ec.example.sheprenure.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.Repository.UserRepository;
import ec.example.sheprenure.Services.userService;
import ec.example.sheprenure.dto.ProfileDto;
import ec.example.sheprenure.dto.*;

import java.util.*;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
public class UserController {
    @Autowired
    private UserRepository repo;

    
    @Autowired
    private userService userv;


    @GetMapping("/admin/showusers")
    public List<UserEntity> getMethodName() {
        List<UserEntity> data=repo.findAll();
        return data;
    }

@GetMapping("/user/me")
public ProfileDto getProfile() {
    return userv.getProfilee();
}


@PatchMapping("/rechangepassword")
public String getChange(@RequestBody PasswordDto reqobj){
    return userv.rechange(reqobj);
}

@PatchMapping("/updateprofile")
public String getUpdate(@RequestBody UpdateProfileDto reqobj){
    return userv.updateUse(reqobj);
}




}
