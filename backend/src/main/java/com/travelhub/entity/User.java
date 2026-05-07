package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String fullName;
    
    @Column(nullable = false)
    private String phone;
    
    private String whatsappNumber;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String profilePhoto;

    @Column(nullable = false)
    private Boolean phoneVerified;

    @Column(nullable = false)
    private Boolean emailVerified;

    private Double rating;

    private Integer reviewCount;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
   @Column(nullable = false)
   private Long numberOfTrips;
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if(rating==null)rating = 0.0;
        if(reviewCount==null)reviewCount = 0;
        if (numberOfTrips == null) numberOfTrips = 0L;
        if (phoneVerified == null) phoneVerified = Boolean.TRUE; // phone OTP happens at registration
        if (emailVerified == null) emailVerified = Boolean.FALSE;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
}

