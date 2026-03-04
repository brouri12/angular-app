package com.esprit.demo.service;

import com.esprit.demo.entity.Note;
import com.esprit.demo.repository.NoteRepo;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@AllArgsConstructor
public class NoteServiceImp implements INoteService{
    final NoteRepo noteRepo;


    @Override
    public Note addNote(Note note) {
        return noteRepo.save(note);
    }

    @Override
    public Note updateEval(Note note) {
        return noteRepo.save(note);
    }

    @Override
    public List<Note> getAllNotes() {
        return noteRepo.findAll();
    }

    @Override
    public Note getNoteById(Long idNote) {
        return noteRepo.findById(idNote).get();
    }

    @Override
    public void deleteNote(Long idNote) {
    noteRepo.deleteById(idNote);
    }
}
