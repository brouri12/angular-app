package com.esprit.demo.service;

import com.esprit.demo.entity.Answer;

import java.util.List;

public interface IAnswerService {
    Answer addAnswer(Answer answer);
    Answer updateAnswer(Answer answer);
    List<Answer> getAllAnswers();
    Answer getEvalById(Long idAnswer);
    void deleteAnswer(Long idAnswer);
}
