package com.travelhub.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private Long packageId;
    private String packageTitle;
    private String packageDestination;
    private String packageOrigin;
    private String packageStartDate;
    private Integer packageDurationDays;
    private String packageImage; // first media URL
    private String transportationLabel;
    private String transportationIcon;

    // Host info
    private Long hostId;
    private String hostName;
    private String hostPhoto;
    private String hostPhone;
    private String hostWhatsapp;

    // Passenger info
    private Long passengerId;
    private String passengerName;
    private String passengerPhoto;
    private String passengerPhone;
    private String passengerWhatsapp;

    // Booking details
    private Integer seatsBooked;
    private String message;
    private String status;
    private Boolean instantBooking;

    // Rating
    private Integer rating;
    private String review;
    private LocalDateTime ratedAt;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
