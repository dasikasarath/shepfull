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
import ec.example.sheprenure.Repository.UserRepository;
import ec.example.sheprenure.jwt;
import ec.example.sheprenure.Entity.Blocklist;
import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
@Service //no auth needed//
public class userService {

    @Autowired
    private UserRepository urepo;

    @Autowired
    private BlocklistRepository brepo;

    @Autowired
    private jwt jt;

    public String logintok(UserDto obj){

        UserEntity dbobj=urepo.findByName(obj.getName()).orElse(null);


        if(dbobj!=null){

        if(!obj.getPassword().equals(dbobj.getPassword())){
            return "Incorrect password";
        }
        else if(obj.getPassword().equals(dbobj.getPassword())){

            return jt.generateToken(dbobj);
        

        }
        }

        return "Incorrect credentials!";


}




public String postReg(UserEntity data){
UserEntity db=urepo.findByName(data.getName()).orElse(null);
if(db!=null){
    return "use another user name";
}
data.setRole("USER");//astadigbandam//
urepo.save(data);
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

     urepo.save(dbobj);


     return "updated successfully";
}


}
