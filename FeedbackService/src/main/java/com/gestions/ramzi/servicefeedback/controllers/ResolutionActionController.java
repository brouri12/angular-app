package com.gestions.ramzi.servicefeedback.controllers;

import com.gestions.ramzi.servicefeedback.entities.ResolutionAction;
import com.gestions.ramzi.servicefeedback.services.ResolutionActionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resolutions")
public class ResolutionActionController {

    private final ResolutionActionService service;

    public ResolutionActionController(ResolutionActionService service) {
        this.service = service;
    }

    @GetMapping
    public List<ResolutionAction> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResolutionAction getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/reclamation/{reclamationId}")
    public List<ResolutionAction> getByReclamation(@PathVariable Long reclamationId) {
        return service.getByReclamationId(reclamationId);
    }

    @PostMapping
    public ResolutionAction create(@RequestBody ResolutionAction action) {
        return service.create(action);
    }

    @PutMapping("/{id}")
    public ResolutionAction update(@PathVariable Long id, @RequestBody ResolutionAction action) {
        return service.update(id, action);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
