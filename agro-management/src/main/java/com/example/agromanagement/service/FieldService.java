package com.example.agromanagement.service;

import com.example.agromanagement.entity.Field;
import com.example.agromanagement.entity.User;
import com.example.agromanagement.repository.FieldRepository;
import com.example.agromanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FieldService {

    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;

    @Autowired
    public FieldService(FieldRepository fieldRepository,
                        UserRepository userRepository) {
        this.fieldRepository = fieldRepository;
        this.userRepository  = userRepository;
    }

    /**
     * Get all fields (for ADMIN).
     */
    public List<Field> getAllFields() {
        return fieldRepository.findAll();
    }

    /**
     * Get own fields by username.
     */
    public List<Field> getFieldsByUsername(String username) {
        return fieldRepository.findByOwnerUsername(username);
    }

    /**
     * Find field by ID.
     */
    public Optional<Field> getFieldById(Long id) {
        return fieldRepository.findById(id);
    }

    /**
     * Save field (create/update), assigning owner on create.
     */
    public Field saveField(Field field, String username) {
        if (field.getOwner() == null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            field.setOwner(user);
        }
        return fieldRepository.save(field);
    }

    /**
     * Delete field only if owned by current user.
     */
    public void deleteIfOwnedBy(Long fieldId, String username) {
        fieldRepository.findById(fieldId).ifPresent(field -> {
            if (field.getOwner() != null && field.getOwner().getUsername().equals(username)) {
                fieldRepository.delete(field);
            }
        });
    }
}