package com.travelhub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "Number is required")
    @Email(message = "Invalid number format")
    private String number;
    
    @NotBlank(message = "Password is required")
    private String password;
}

