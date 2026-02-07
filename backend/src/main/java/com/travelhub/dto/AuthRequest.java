package com.travelhub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Pattern;

@Data
public class AuthRequest {
    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[6-9][0-9]{9}$",
        message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    private String phone;
    
    @NotBlank(message = "Password is required")
    private String password;
}

