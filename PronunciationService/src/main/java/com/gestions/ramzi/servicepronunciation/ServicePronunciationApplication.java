package com.gestions.ramzi.servicepronunciation;

import com.gestions.ramzi.servicepronunciation.services.RecordingService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServicePronunciationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServicePronunciationApplication.class, args);
    }
}
