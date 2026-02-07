package com.travelhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class updateAuth {
    @NotBlank(message = "Full Name is required")
    private String fullName;

    @Pattern(
        regexp = "^[6-9][0-9]{9}$",
        message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    private String whatsappNumber;
}

