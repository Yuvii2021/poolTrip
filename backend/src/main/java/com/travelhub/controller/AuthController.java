package com.travelhub.controller;

import com.travelhub.dto.AuthRequest;
import com.travelhub.dto.AuthResponse;
import com.travelhub.dto.RegisterRequest;
import com.travelhub.dto.updateAuth;
import com.travelhub.dto.ForgotPasswordRequest;
import com.travelhub.dto.ResetPasswordRequest;
import com.travelhub.dto.SendOtpRequest;
import com.travelhub.dto.SendEmailOtpRequest;
import com.travelhub.dto.VerifyEmailOtpRequest;
import com.travelhub.entity.User;
import com.travelhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
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
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", user.getId());
        resp.put("email", user.getEmail());
        resp.put("fullName", user.getFullName());
        resp.put("phone", user.getPhone());
        resp.put("whatsappNumber", user.getWhatsappNumber() != null ? user.getWhatsappNumber() : "");
        resp.put("bio", user.getBio() != null ? user.getBio() : "");
        resp.put("profilePhoto", user.getProfilePhoto()); // can be null
        resp.put("phoneVerified", user.getPhoneVerified() != null ? user.getPhoneVerified() : true);
        resp.put("emailVerified", Boolean.TRUE.equals(user.getEmailVerified()));
        resp.put("rating", user.getRating() != null ? user.getRating() : 0.0);
        resp.put("reviewCount", user.getReviewCount() != null ? user.getReviewCount() : 0);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@AuthenticationPrincipal UserDetails userDetails,@Valid @RequestBody updateAuth updates) {
        User updatedUser = authService.updateCurrentUser(userDetails.getUsername(), updates);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", updatedUser.getId());
        resp.put("email", updatedUser.getEmail());
        resp.put("fullName", updatedUser.getFullName());
        resp.put("phone", updatedUser.getPhone());
        resp.put("whatsappNumber", updatedUser.getWhatsappNumber() != null ? updatedUser.getWhatsappNumber() : "");
        resp.put("bio", updatedUser.getBio() != null ? updatedUser.getBio() : "");
        resp.put("profilePhoto", updatedUser.getProfilePhoto()); // can be null
        resp.put("phoneVerified", updatedUser.getPhoneVerified() != null ? updatedUser.getPhoneVerified() : true);
        resp.put("emailVerified", Boolean.TRUE.equals(updatedUser.getEmailVerified()));
        resp.put("rating", updatedUser.getRating() != null ? updatedUser.getRating() : 0.0);
        resp.put("reviewCount", updatedUser.getReviewCount() != null ? updatedUser.getReviewCount() : 0);
        resp.put("numberOfTrips", updatedUser.getNumberOfTrips() != null ? updatedUser.getNumberOfTrips() : 0L);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        User user = authService.getUserById(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("id", user.getId());
        resp.put("fullName", user.getFullName());
        resp.put("phone", user.getPhone());
        resp.put("whatsappNumber", user.getWhatsappNumber() != null ? user.getWhatsappNumber() : "");
        resp.put("bio", user.getBio() != null ? user.getBio() : "");
        resp.put("rating", user.getRating() != null ? user.getRating() : 0.0);
        resp.put("reviewCount", user.getReviewCount() != null ? user.getReviewCount() : 0);
        resp.put("numberOfTrips", user.getNumberOfTrips() != null ? user.getNumberOfTrips() : 0L);
        resp.put("profilePhoto", user.getProfilePhoto());
        resp.put("phoneVerified", user.getPhoneVerified() != null ? user.getPhoneVerified() : true);
        resp.put("emailVerified", Boolean.TRUE.equals(user.getEmailVerified()));
        return ResponseEntity.ok(resp);
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

    @PostMapping("/email/send-otp")
    public ResponseEntity<Map<String, String>> sendEmailOtp(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SendEmailOtpRequest request
    ) {
        authService.sendOtpForEmailVerification(userDetails.getUsername(), request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP has been sent to your email"));
    }

    @PostMapping("/email/verify-otp")
    public ResponseEntity<Map<String, String>> verifyEmailOtp(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VerifyEmailOtpRequest request
    ) {
        authService.verifyEmailOtp(userDetails.getUsername(), request.getOtp());
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    @PostMapping("/me/profile-photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("photo") MultipartFile photo
    ) {
        User updated = authService.uploadProfilePhoto(userDetails.getUsername(), photo);
        Map<String, Object> resp = new HashMap<>();
        resp.put("profilePhoto", updated.getProfilePhoto());
        resp.put("emailVerified", Boolean.TRUE.equals(updated.getEmailVerified()));
        resp.put("phoneVerified", updated.getPhoneVerified() != null ? updated.getPhoneVerified() : true);
        return ResponseEntity.ok(resp);
    }
}

