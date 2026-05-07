package com.travelhub.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    private Long packageId;
    private Integer seats;
    private String message; // optional note to host
}
