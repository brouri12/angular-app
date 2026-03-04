package com.example.demoEureka;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableAutoConfiguration
@EnableEurekaServer

class DemoEurekaApplicationTests {

	@Test
	void contextLoads() {
	}

}
