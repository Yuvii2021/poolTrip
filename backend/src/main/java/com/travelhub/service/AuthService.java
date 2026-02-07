package com.travelhub.service;

import com.travelhub.dto.AuthRequest;
import com.travelhub.dto.AuthResponse;
import com.travelhub.dto.RegisterRequest;
import com.travelhub.dto.updateAuth;
import com.travelhub.entity.OtpVerification;
import com.travelhub.entity.User;
import com.travelhub.repository.UserRepository;
import com.travelhub.repository.OtpVerificationRepository;
import com.travelhub.security.JwtUtil;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OtpVerificationRepository otpVerificationRepository;
    
    private void verifyOtp(String phone, String otp) {

        OtpVerification otpVerification = otpVerificationRepository
                .findTopByPhoneOrderByExpiresAtDesc(phone)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (!otpVerification.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        otpVerification.setVerified(true);
        otpVerificationRepository.save(otpVerification);
    }

    public void otpSending(Long phone) {

        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        
        OtpVerification otpVerification = OtpVerification.builder()
                .phone(String.valueOf(phone))
                .otp(otp)
                .verified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        otpVerificationRepository.save(otpVerification);
        // TODO: integrate SMS provider (Twilio, MSG91, etc.)
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Number already exists");
        }
        
        verifyOtp(request.getPhone(), request.getOtp());
        
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .whatsappNumber(request.getWhatsappNumber())
                .build();
        
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getPhone());
        
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .whatsappNumber(user.getWhatsappNumber())
                .build();
    }
    
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getPhone(), request.getPassword())
        );
        
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getPhone());
        
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .whatsappNumber(user.getWhatsappNumber())
                .build();
    }
    
    public User getCurrentUser(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateCurrentUser(String phone, updateAuth updateAuth) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ===== ALLOWED UPDATES ONLY =====
        if (updateAuth.getFullName() != null && !updateAuth.getFullName().isBlank()) {
            user.setFullName(updateAuth.getFullName());
        }
        if (updateAuth.getWhatsappNumber() != null && !updateAuth.getWhatsappNumber().isBlank()) {
            user.setWhatsappNumber(updateAuth.getWhatsappNumber());
        }
        // DO NOT allow updates for:
        // email, password, rating, reviewCount, numberOfTrips
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

}

