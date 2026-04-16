package com.example.agromanagement.service;

import com.example.agromanagement.entity.User;
import com.example.agromanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.agromanagement.dto.UserStatsDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Сохранить пользователя (создание/обновление). Пароль должен быть уже закодирован.
     */
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Проверить, существует ли пользователь с таким username
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Найти пользователя по username
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Получить список всех пользователей (для ADMIN)
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Создать пользователя с ролью ROLE_USER
     */
    public User registerNewUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        roleRepository.findByName("ROLE_USER").ifPresent(user.getRoles()::add);
        return userRepository.save(user);
    }
}

