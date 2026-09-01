
package ec.example.sheprenure.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import ec.example.sheprenure.CookieUtils;
import ec.example.sheprenure.jwt;
import ec.example.sheprenure.Entity.UserEntity;
import ec.example.sheprenure.Services.userService;
import ec.example.sheprenure.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private userService userv;

    @Autowired
    private jwt jwtUtil;

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
    public ResponseEntity<?> postlogin(@RequestBody UserDto obj, HttpServletResponse response) {
        try {
            UserEntity user = userv.authenticateUser(obj);
            String token = jwtUtil.generateToken(user);
            ResponseCookie cookie = CookieUtils.createJwtCookie(token, false);
            CookieUtils.addCookieToResponse(response, cookie);
            AuthUserDto authUser = new AuthUserDto(user.getUserId(), user.getName(), user.getEmail(), user.getRole());
            return ResponseEntity.ok(authUser);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Authentication failed");
        }
    }

    @GetMapping("/auth/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            AuthUserDto user = userv.getCurrentAuthUser();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

    // using logout is not good because springboot has default name logout it intercept
    @PostMapping("/logouts")
    public ResponseEntity<String> postMethodlogout(HttpServletRequest req, HttpServletResponse resp) {
        return ResponseEntity.ok(userv.logout(req, resp));
    }
}
