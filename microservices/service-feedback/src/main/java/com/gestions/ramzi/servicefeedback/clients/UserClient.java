package com.gestions.ramzi.servicefeedback.clients;

import com.gestions.ramzi.servicefeedback.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "service-user", url = "${app.user-service.url:http://localhost:8081}")
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
    
    @GetMapping("/api/users")
    java.util.List<UserDTO> getAllUsers();
}
