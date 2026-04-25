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
     * Get all crops (for ADMIN).
     */
    public List<Crop> getAllCrops() {
        return cropRepository.findAll();
    }

    /**
     * Get own crops by username.
     */
    public List<Crop> getCropsByUsername(String username) {
        return cropRepository.findByOwnerUsername(username);
    }

    /**
     * Find crop by ID.
     */
    public Optional<Crop> getCropById(Long id) {
        return cropRepository.findById(id);
    }

    /**
     * Save crop (create/update), assigning owner on create.
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
     * Delete crop only if owned by current user.
     */
    public void deleteIfOwnedBy(Long cropId, String username) {
        cropRepository.findById(cropId).ifPresent(crop -> {
            if (crop.getOwner() != null && crop.getOwner().getUsername().equals(username)) {
                cropRepository.delete(crop);
            }
        });
    }
}