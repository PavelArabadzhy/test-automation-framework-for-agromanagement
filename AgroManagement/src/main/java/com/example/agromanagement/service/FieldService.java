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
     * Получить все поля (для ADMIN)
     */
    public List<Field> getAllFields() {
        return fieldRepository.findAll();
    }

    /**
     * Получить только свои поля по username
     */
    public List<Field> getFieldsByUsername(String username) {
        return fieldRepository.findByOwnerUsername(username);
    }

    /**
     * Найти поле по ID
     */
    public Optional<Field> getFieldById(Long id) {
        return fieldRepository.findById(id);
    }

    /**
     * Сохранить поле (создание/обновление), привязывая владельца при создании
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
     * Удалить поле только если его владелец — текущий пользователь
     */
    public void deleteIfOwnedBy(Long fieldId, String username) {
        fieldRepository.findById(fieldId).ifPresent(field -> {
            if (field.getOwner() != null && field.getOwner().getUsername().equals(username)) {
                fieldRepository.delete(field);
            }
        });
    }
}