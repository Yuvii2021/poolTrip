package com.travelhub.controller;

import com.travelhub.entity.Subscriber;
import com.travelhub.repository.SubscriberRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SubscriberController {

    private final SubscriberRepository subscriberRepository;
    private final JavaMailSender mailSender;
    private final Environment environment;

    @Data
    public static class SubscribeRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@Valid @RequestBody SubscribeRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (subscriberRepository.existsByEmail(email)) {
            return ResponseEntity.ok(Map.of("message", "You're already subscribed! We'll keep you posted."));
        }

        Subscriber subscriber = Subscriber.builder().email(email).build();
        subscriberRepository.save(subscriber);

        // Send welcome email (best-effort, don't fail the request if mail fails)
        try {
            sendWelcomeEmail(email);
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", email, e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Thanks for subscribing! We'll send you the best deals."));
    }

    private void sendWelcomeEmail(String email) {
        String mailHost = environment.getProperty("spring.mail.host");
        String mailUsername = environment.getProperty("spring.mail.username");
        boolean canSend = mailHost != null && !mailHost.isBlank();

        if (!canSend) {
            log.warn("MAIL not configured. Skipping welcome email for {}", email);
            return;
        }

        SimpleMailMessage msg = new SimpleMailMessage();
        if (mailUsername != null && !mailUsername.isBlank()) {
            msg.setFrom(mailUsername);
        }
        msg.setTo(email);
        msg.setSubject("Welcome to PoolTrip!");
        msg.setText(
            "Hi there!\n\n" +
            "Thanks for subscribing to PoolTrip. You'll now receive the best travel deals " +
            "and trip updates directly in your inbox.\n\n" +
            "Happy traveling!\n" +
            "— The PoolTrip Team"
        );
        mailSender.send(msg);
    }
}
