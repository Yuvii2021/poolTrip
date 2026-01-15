package com.travelhub.dto;

import com.travelhub.entity.User.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    @NotNull(message = "Role is required")
    private UserRole role;
    
    // Agency specific fields (optional for regular users)
    private String agencyName;
    private String agencyDescription;
    private String agencyLogo;
    private String whatsappNumber;
    private String address;
    private String city;
}

