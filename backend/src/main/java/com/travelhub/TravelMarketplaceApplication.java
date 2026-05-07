package com.travelhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TravelMarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TravelMarketplaceApplication.class, args);
    }
}

