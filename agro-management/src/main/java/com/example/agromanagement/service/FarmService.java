package com.example.agromanagement.service;

import com.example.agromanagement.entity.Farm;
import com.example.agromanagement.entity.User;
import com.example.agromanagement.repository.FarmRepository;
import com.example.agromanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;

    @Autowired
    public FarmService(FarmRepository farmRepository,
                       UserRepository userRepository) {
        this.farmRepository = farmRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get all farms (for ADMIN).
     */
    public List<Farm> getAllFarms() {
        return farmRepository.findAll();
    }

    /**
     * Get own farms by username.
     */
    public List<Farm> getFarmsByUsername(String username) {
        return farmRepository.findByOwnerUsername(username);
    }

    /**
     * Find farm by ID.
     */
    public Optional<Farm> getFarmById(Long id) {
        return farmRepository.findById(id);
    }

    /**
     * Save farm (create/update), assigning owner on create.
     */
    public Farm saveFarm(Farm farm, String username) {
        if (farm.getOwner() == null) {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
            farm.setOwner(user);
        }
        return farmRepository.save(farm);
    }

    /**
     * Delete farm only if owned by current user.
     */
    public void deleteIfOwnedBy(Long farmId, String username) {
        farmRepository.findById(farmId).ifPresent(farm -> {
            if (farm.getOwner() != null && farm.getOwner().getUsername().equals(username)) {
                farmRepository.delete(farm);
            }
        });
    }
}
