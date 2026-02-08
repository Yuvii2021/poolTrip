package com.travelhub.controller;

import com.travelhub.dto.AuthRequest;
import com.travelhub.dto.AuthResponse;
import com.travelhub.dto.RegisterRequest;
import com.travelhub.dto.updateAuth;
import com.travelhub.dto.ForgotPasswordRequest;
import com.travelhub.dto.ResetPasswordRequest;
import com.travelhub.dto.SendOtpRequest;
import com.travelhub.entity.User;
import com.travelhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Debug logging
        System.out.println("Received registration request:");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Phone: " + request.getPhone());
        System.out.println("FullName: " + request.getFullName());
        System.out.println("Otp: " + (request.getOtp() != null ? request.getOtp() : "NULL"));
        System.out.println("Otp length: " + (request.getOtp() != null ? request.getOtp().length() : 0));
        System.out.println("WhatsappNumber: " + request.getWhatsappNumber());
        
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "phone", user.getPhone(),
                "whatsappNumber", user.getWhatsappNumber() != null ? user.getWhatsappNumber() : "",
                "rating", user.getRating(),
                "reviewCount", user.getReviewCount()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@AuthenticationPrincipal UserDetails userDetails,@Valid @RequestBody updateAuth updates) {
        User updatedUser = authService.updateCurrentUser(userDetails.getUsername(), updates);

        return ResponseEntity.ok(Map.of(
                "id", updatedUser.getId(),
                "email", updatedUser.getEmail(),
                "fullName", updatedUser.getFullName(),
                "phone", updatedUser.getPhone(),
                "whatsappNumber", updatedUser.getWhatsappNumber() != null ? updatedUser.getWhatsappNumber() : "",
                "rating", updatedUser.getRating(),
                "reviewCount", updatedUser.getReviewCount(),
                "numberOfTrips", updatedUser.getNumberOfTrips()));
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(Long id) {
        User user = authService.getUserById(id);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "phone", user.getPhone(),
                "whatsappNumber", user.getWhatsappNumber() != null ? user.getWhatsappNumber() : "",
                "rating", user.getRating(),
                "reviewCount", user.getReviewCount()
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP has been sent to your phone number"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getPhone(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.sendOtpForRegistration(request.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP has been sent to your phone number"));
    }
}

