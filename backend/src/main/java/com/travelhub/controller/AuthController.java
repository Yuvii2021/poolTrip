package com.travelhub.controller;

import com.travelhub.dto.AuthRequest;
import com.travelhub.dto.AuthResponse;
import com.travelhub.dto.RegisterRequest;
import com.travelhub.dto.updateAuth;
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
}

