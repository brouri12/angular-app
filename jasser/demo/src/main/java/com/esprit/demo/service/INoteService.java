package com.esprit.demo.service;

import com.esprit.demo.entity.Evaluation;
import com.esprit.demo.entity.Note;

import java.util.List;

public interface INoteService {

    Note addNote(Note note);
    Note updateEval(Note note);
    List<Note> getAllNotes();
    Note getNoteById(Long idNote);
    void deleteNote(Long idNote);
}
