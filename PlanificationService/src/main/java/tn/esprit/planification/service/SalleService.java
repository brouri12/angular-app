package tn.esprit.planification.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.planification.dto.SalleDTO;
import tn.esprit.planification.entity.Salle;
import tn.esprit.planification.exception.ResourceNotFoundException;
import tn.esprit.planification.mapper.EntityMapper;
import tn.esprit.planification.repository.PlanificationRepository;
import tn.esprit.planification.repository.SalleRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalleService {

    private final SalleRepository salleRepository;
    private final PlanificationRepository planificationRepository;

    @Transactional(readOnly = true)
    public List<SalleDTO> getAllSalles() {
        return salleRepository.findAll().stream()
            .map(EntityMapper::toSalleDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalleDTO getSalleById(Long id) {
        Salle salle = salleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return EntityMapper.toSalleDTO(salle);
    }

    @Transactional
    public SalleDTO createSalle(SalleDTO salleDTO) {
        Salle salle = EntityMapper.toSalleEntity(salleDTO);
        Salle savedSalle = salleRepository.save(salle);
        return EntityMapper.toSalleDTO(savedSalle);
    }

    @Transactional
    public SalleDTO updateSalle(Long id, SalleDTO salleDTO) {
        Salle existingSalle = salleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        existingSalle.setNomSalle(salleDTO.getNomSalle());
        existingSalle.setCapacite(salleDTO.getCapacite());
        existingSalle.setLocalisation(salleDTO.getLocalisation());

        Salle updatedSalle = salleRepository.save(existingSalle);
        return EntityMapper.toSalleDTO(updatedSalle);
    }

    @Transactional
    public void deleteSalle(Long id) {
        if (!salleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with id: " + id);
        }
        salleRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean isSalleAvailable(Long salleId, LocalDate date, LocalTime heureDebut, LocalTime heureFin) {
        if (!salleRepository.existsById(salleId)) {
            throw new ResourceNotFoundException("Room not found with id: " + salleId);
        }
        return salleRepository.isSalleAvailable(salleId, date, heureDebut, heureFin);
    }

    @Transactional(readOnly = true)
    public List<SalleDTO> getSallesByCapacity(Integer minCapacity) {
        return salleRepository.findByCapaciteGreaterThanEqual(minCapacity).stream()
            .map(EntityMapper::toSalleDTO)
            .collect(Collectors.toList());
    }
}

