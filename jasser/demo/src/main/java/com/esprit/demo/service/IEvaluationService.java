package com.esprit.demo.service;

import com.esprit.demo.entity.Evaluation;

import java.util.List;

public interface IEvaluationService {

    Evaluation addEval(Evaluation evaluation);
    Evaluation updateEval(Evaluation evaluation);
    List<Evaluation> getAllEvals();
    List<Evaluation> getOpenEvaluations();
    Evaluation getEvalById(Long idEval);
    void deleteEval(Long idEval);
}
