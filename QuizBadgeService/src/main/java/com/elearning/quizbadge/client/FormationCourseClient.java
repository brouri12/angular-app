package com.elearning.quizbadge.client;

import com.elearning.quizbadge.dto.RemoteCourseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Client déclaratif vers formation-service pour enrichir quiz et badges (titre cours, code).
 */
@FeignClient(name = "formation-service", path = "/api/courses")
public interface FormationCourseClient {

    @GetMapping("/{id}")
    RemoteCourseDTO getCourseById(@PathVariable("id") Long id);
}
