package tn.esprit.challenge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.challenge.dto.ChallengeDTO;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Question;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.mapper.ChallengeMapper;
import tn.esprit.challenge.mapper.QuestionMapper;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.QuestionRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChallengeService {
    
    private final ChallengeRepository challengeRepository;
    private final QuestionRepository questionRepository;
    
    // Get all challenges
    public List<ChallengeDTO> getAllChallenges() {
        return challengeRepository.findAll().stream()
            .map(c -> ChallengeMapper.toDTO(c, false))
            .collect(Collectors.toList());
    }
    
    // Get challenge by ID (for students - without answers)
    public ChallengeDTO getChallengeById(Long id) {
        Challenge challenge = challengeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Challenge not found with id: " + id));
        return ChallengeMapper.toDTO(challenge, false);
    }
    
    // Get challenge by ID (for teachers - with answers)
    public ChallengeDTO getChallengeByIdWithAnswers(Long id) {
        Challenge challenge = challengeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Challenge not found with id: " + id));
        return ChallengeMapper.toDTO(challenge, true);
    }
    
    // Get challenges by level
    public List<ChallengeDTO> getChallengesByLevel(ProficiencyLevel level) {
        return challengeRepository.findByLevel(level).stream()
            .map(c -> ChallengeMapper.toDTO(c, false))
            .collect(Collectors.toList());
    }
    
    // Get challenges by type
    public List<ChallengeDTO> getChallengesByType(ChallengeType type) {
        return challengeRepository.findByType(type).stream()
            .map(c -> ChallengeMapper.toDTO(c, false))
            .collect(Collectors.toList());
    }
    
    // Search challenges
    public List<ChallengeDTO> searchChallenges(String keyword) {
        return challengeRepository.searchByKeyword(keyword).stream()
            .map(c -> ChallengeMapper.toDTO(c, false))
            .collect(Collectors.toList());
    }
    
    // Get popular challenges
    public List<ChallengeDTO> getPopularChallenges() {
        return challengeRepository.findTop10ByOrderByTotalAttemptsDesc().stream()
            .map(c -> ChallengeMapper.toDTO(c, false))
            .collect(Collectors.toList());
    }
    
    // Create challenge
    @Transactional
    public ChallengeDTO createChallenge(ChallengeDTO dto) {
        Challenge challenge = ChallengeMapper.toEntity(dto);
        Challenge saved = challengeRepository.save(challenge);
        
        // Save questions
        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            for (int i = 0; i < dto.getQuestions().size(); i++) {
                Question question = QuestionMapper.toEntity(dto.getQuestions().get(i));
                question.setChallenge(saved);
                question.setOrderIndex(i);
                questionRepository.save(question);
            }
        }
        
        log.info("Created challenge: {}", saved.getTitle());
        return ChallengeMapper.toDTO(challengeRepository.findById(saved.getId()).get(), true);
    }
    
    // Update challenge
    @Transactional
    public ChallengeDTO updateChallenge(Long id, ChallengeDTO dto) {
        Challenge existing = challengeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Challenge not found"));
        
        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setType(dto.getType());
        existing.setSkillFocus(dto.getSkillFocus());
        existing.setLevel(dto.getLevel());
        existing.setCategory(dto.getCategory());
        existing.setPoints(dto.getPoints());
        existing.setTimeLimit(dto.getTimeLimit());
        existing.setContent(dto.getContent());
        existing.setIsPublic(dto.getIsPublic());
        existing.setTags(dto.getTags());
        existing.setAudioUrl(dto.getAudioUrl());
        existing.setImageUrl(dto.getImageUrl());
        
        Challenge updated = challengeRepository.save(existing);
        log.info("Updated challenge: {}", updated.getTitle());
        return ChallengeMapper.toDTO(updated, true);
    }
    
    // Delete challenge
    @Transactional
    public void deleteChallenge(Long id) {
        challengeRepository.deleteById(id);
        log.info("Deleted challenge with id: {}", id);
    }
    
    // Increment attempt counter
    @Transactional
    public void incrementAttempts(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
            .orElseThrow(() -> new RuntimeException("Challenge not found"));
        challenge.setTotalAttempts(challenge.getTotalAttempts() + 1);
        challengeRepository.save(challenge);
    }
    
    // Increment successful completions
    @Transactional
    public void incrementSuccessfulCompletions(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
            .orElseThrow(() -> new RuntimeException("Challenge not found"));
        challenge.setSuccessfulCompletions(challenge.getSuccessfulCompletions() + 1);
        challengeRepository.save(challenge);
    }
}
