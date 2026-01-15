package com.travelhub.dto;

import com.travelhub.entity.User.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String email; maindatory nhi hai
    private String fullName;
    private String phone;
    private String whatsappNumber; maindatory nhi hai
}

