package com.gestions.ramzi.serviceuser.service;

import com.gestions.ramzi.serviceuser.entity.User;
import com.gestions.ramzi.serviceuser.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public List<User> getAll() {
        return repo.findAll();
    }

    public Optional<User> getById(Long id) {
        return repo.findById(id);
    }

    public Optional<User> getByUsername(String username) {
        return repo.findByUsername(username);
    }

    public User save(User user) {
        return repo.save(user);
    }

    public User update(Long id, User user) {
        Optional<User> existing = repo.findById(id);
        if (existing.isPresent()) {
            User u = existing.get();
            u.setUsername(user.getUsername());
            u.setEmail(user.getEmail());
            u.setRole(user.getRole());
            return repo.save(u);
        }
        return null;
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
