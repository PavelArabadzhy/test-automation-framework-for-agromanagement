package com.example.agromanagement.service;

import com.example.agromanagement.entity.Crop;
import com.example.agromanagement.entity.User;
import com.example.agromanagement.repository.CropRepository;
import com.example.agromanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CropService {

    private final CropRepository cropRepository;
    private final UserRepository userRepository;

    @Autowired
    public CropService(CropRepository cropRepository,
                       UserRepository userRepository) {
        this.cropRepository = cropRepository;
        this.userRepository = userRepository;
    }

    /**
     * Получить все культуры (для ADMIN)
     */
    public List<Crop> getAllCrops() {
        return cropRepository.findAll();
    }

    /**
     * Получить только свои культуры по username
     */
    public List<Crop> getCropsByUsername(String username) {
        return cropRepository.findByOwnerUsername(username);
    }

    /**
     * Найти культуру по ID
     */
    public Optional<Crop> getCropById(Long id) {
        return cropRepository.findById(id);
    }

    /**
     * Сохранить культуру (создание/обновление), привязывая владельца при создании
     */
    public Crop saveCrop(Crop crop, String username) {
        if (crop.getOwner() == null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            crop.setOwner(user);
        }
        return cropRepository.save(crop);
    }

    /**
     * Удалить культуру только если её владелец — текущий пользователь
     */
    public void deleteIfOwnedBy(Long cropId, String username) {
        cropRepository.findById(cropId).ifPresent(crop -> {
            if (crop.getOwner() != null && crop.getOwner().getUsername().equals(username)) {
                cropRepository.delete(crop);
            }
        });
    }
}