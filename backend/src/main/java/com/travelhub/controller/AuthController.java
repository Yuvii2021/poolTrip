package com.travelhub.controller;

import com.travelhub.dto.AuthRequest;
import com.travelhub.dto.AuthResponse;
import com.travelhub.dto.RegisterRequest;
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
                "role", user.getRole(),
                "agencyName", user.getAgencyName() != null ? user.getAgencyName() : "",
                "whatsappNumber", user.getWhatsappNumber() != null ? user.getWhatsappNumber() : "",
                "agencyLogo", user.getAgencyLogo() != null ? user.getAgencyLogo() : "",
                "city", user.getCity() != null ? user.getCity() : ""
        ));
    }
}

