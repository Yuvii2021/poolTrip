package com.travelhub.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyEmailOtpRequest {
    @NotBlank(message = "Otp is required")
    private String otp;
}
