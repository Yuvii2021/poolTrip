package com.travelhub.enums;

public enum Transportation {

    // ===== BUS =====
    BUS_AC("AC Bus", "🚌"),
    BUS_NON_AC("Non-AC Bus", "🚌"),
    BUS_SLEEPER("Sleeper Bus", "🛏️"),
    BUS_SEMI_SLEEPER("Semi Sleeper Bus", "🚌"),
    BUS_VOLVO("Volvo Bus", "🚌"),

    // ===== CAR =====
    CAR_HATCHBACK("Hatchback", "🚗"),
    CAR_SEDAN("Sedan", "🚘"),
    CAR_SUV("SUV", "🚙"),
    CAR_LUXURY("Luxury Car", "💎"),

    // ===== TRAIN =====
    TRAIN_GENERAL("General Train", "🚆"),
    TRAIN_SLEEPER("Sleeper Train", "🚆"),
    TRAIN_3A("3AC Train", "🚆"),
    TRAIN_2A("2AC Train", "🚆"),
    TRAIN_1A("1AC Train", "🚆"),

    // ===== FLIGHT =====
    FLIGHT_ECONOMY("Economy Flight", "✈️"),
    FLIGHT_PREMIUM_ECONOMY("Premium Economy Flight", "🛫"),
    FLIGHT_BUSINESS("Business Flight", "🛩️"),

    // ===== OTHER =====
    BIKE("Bike", "🏍️"),
    TEMPO_TRAVELLER("Tempo Traveller", "🚐"),
    CRUISE("Cruise", "🛳️"),
    MIXED("Mixed Transport", "🔀");

    private final String label;
    private final String icon;

    Transportation(String label, String icon) {
        this.label = label;
        this.icon = icon;
    }

    public String getLabel() {
        return label;
    }

    public String getIcon() {
        return icon;
    }
}