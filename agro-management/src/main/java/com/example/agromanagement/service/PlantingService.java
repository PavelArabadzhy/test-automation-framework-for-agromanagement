package com.example.agromanagement.service;

import com.example.agromanagement.entity.Planting;
import com.example.agromanagement.entity.User;
import com.example.agromanagement.repository.PlantingRepository;
import com.example.agromanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlantingService {

    private final PlantingRepository plantingRepository;
    private final UserRepository userRepository;

    @Autowired
    public PlantingService(PlantingRepository plantingRepository,
                           UserRepository userRepository) {
        this.plantingRepository = plantingRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all plantings (for ADMIN).
     */
    public List<Planting> getAllPlantings() {
        return plantingRepository.findAll();
    }

    /**
     * Get own plantings by username.
     */
    public List<Planting> getPlantingsByUsername(String username) {
        return plantingRepository.findByFieldOwnerUsername(username);
    }

    /**
     * Find planting by ID.
     */
    public Optional<Planting> getPlantingById(Long id) {
        return plantingRepository.findById(id);
    }

    /**
     * Save planting, assigning field owner on create.
     */
    public Planting savePlanting(Planting planting, String username) {
        if (planting.getField().getOwner() == null ||
                !planting.getField().getOwner().getUsername().equals(username)) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            planting.getField().setOwner(user);
        }
        return plantingRepository.save(planting);
    }

    /**
     * Delete planting by ID.
     */
    public void deletePlanting(Long id) {
        plantingRepository.deleteById(id);
    }

    /**
     * Delete planting only if owned by current user.
     */
    public void deleteIfOwnedBy(Long plantingId, String username) {
        plantingRepository.findById(plantingId).ifPresent(p -> {
            if (p.getField().getOwner().getUsername().equals(username)) {
                plantingRepository.delete(p);
            }
        });
    }
}
