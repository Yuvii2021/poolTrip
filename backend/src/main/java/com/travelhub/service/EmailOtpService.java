package com.travelhub.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Locale;

import org.springframework.core.env.Environment;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.travelhub.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailOtpService {

    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final SecureRandom RNG = new SecureRandom();

    private final StringRedisTemplate stringRedisTemplate;
    private final Environment environment;
    private final JavaMailSender mailSender;

    private String otpKey(String username, String email) {
        String u = (username == null ? "user" : username.trim().replaceAll("\\s+", "_")).toLowerCase(Locale.ROOT);
        String e = (email == null ? "" : email.trim().toLowerCase(Locale.ROOT));
        return "otp:email:" + u + "_" + e;
    }

    private String generateOtp() {
        int val = 100000 + RNG.nextInt(900000);
        return String.valueOf(val);
    }

    public void sendEmailOtp(User user, String email) {
        String otp = generateOtp();
        String key = otpKey(user.getFullName(), email);

        stringRedisTemplate.opsForValue().set(key, otp, OTP_TTL);

        String mailHost = environment.getProperty("spring.mail.host");
        String mailUsername = environment.getProperty("spring.mail.username");
        boolean canSend = mailHost != null && !mailHost.isBlank();

        if (!canSend) {
            log.warn("MAIL not configured (spring.mail.host empty). Email OTP generated for {}: {}", email, otp);
            return;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            if (mailUsername != null && !mailUsername.isBlank()) {
                msg.setFrom(mailUsername);
            }
            msg.setTo(email);
            msg.setSubject("PoolTrip - Email Verification OTP");
            msg.setText("Your PoolTrip email verification OTP is: " + otp + "\n\nThis OTP will expire in 5 minutes.");

            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send email OTP to {}", email, e);
            throw new RuntimeException("Failed to send OTP email");
        }
    }

    public boolean verifyEmailOtp(User user, String email, String otp) {
        String key = otpKey(user.getFullName(), email);
        String expected = stringRedisTemplate.opsForValue().get(key);
        if (expected == null) return false;
        if (!expected.equals(otp)) return false;
        stringRedisTemplate.delete(key);
        return true;
    }
}

