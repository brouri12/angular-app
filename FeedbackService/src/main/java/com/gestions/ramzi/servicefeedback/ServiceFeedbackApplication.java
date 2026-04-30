package com.gestions.ramzi.servicefeedback;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.gestions.ramzi.servicefeedback.clients")
public class ServiceFeedbackApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceFeedbackApplication.class, args);
    }

}
