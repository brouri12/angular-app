package com.esprit.demo.service;

import com.esprit.demo.entity.Answer;
import com.esprit.demo.repository.AnswerRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@AllArgsConstructor
public class AnswerService implements IAnswerService {
    final AnswerRepo answerRepo;



    @Override
    public Answer addAnswer(Answer answer) {
        return answerRepo.save(answer);
    }

    @Override
    public Answer updateAnswer(Answer answer) {
        return answerRepo.save(answer);
    }

    @Override
    public List<Answer> getAllAnswers() {
        return answerRepo.findAll();
    }

    @Override
    public Answer getEvalById(Long idAnswer) {
        return answerRepo.findById(idAnswer).get();
    }

    @Override
    public void deleteAnswer(Long idAnswer) {
        answerRepo.deleteById(idAnswer);
    }
}
