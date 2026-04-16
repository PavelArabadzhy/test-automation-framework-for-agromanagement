package com.example.agromanagement.service;

import com.example.agromanagement.dto.UserStatsDto;
import com.example.agromanagement.entity.User;
import com.example.agromanagement.repository.FarmRepository;
import com.example.agromanagement.repository.FieldRepository;
import com.example.agromanagement.repository.HarvestRepository;
import com.example.agromanagement.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final UserRepository userRepo;
    private final FarmRepository farmRepo;
    private final FieldRepository fieldRepo;
    private final HarvestRepository harvestRepo;

    @Autowired
    public AdminService(UserRepository userRepository,
                        UserRepository userRepo,
                        FarmRepository farmRepo,
                        FieldRepository fieldRepo,
                        HarvestRepository harvestRepo) {
        this.userRepository = userRepository;
        this.userRepo       = userRepo;
        this.farmRepo       = farmRepo;
        this.fieldRepo      = fieldRepo;
        this.harvestRepo    = harvestRepo;
    }

    public List<UserStatsDto> getAllUsersStats() {
        return userRepo.findAll().stream()
                .map(u -> mapToDto(u.getId(), u.getUsername(), u.getEmail()))
                .collect(Collectors.toList());
    }

    public Optional<UserStatsDto> findUserStatsById(Long id) {
        return userRepo.findById(id)
                .map(u -> mapToDto(u.getId(), u.getUsername(), u.getEmail()));
    }

    @Transactional
    public void updateUser(UserStatsDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + dto.getUserId()));
        // Разрешаем редактировать только username и email
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        userRepository.save(user);
    }

    private UserStatsDto mapToDto(Long userId, String username, String email) {
        long farms  = farmRepo.countByOwnerUsername(username);
        long fields = fieldRepo.countByOwnerUsername(username);
        BigDecimal totalYield = harvestRepo.sumYieldByUsername(username).orElse(BigDecimal.ZERO);
        BigDecimal avgYield   = harvestRepo.avgYieldByUsername(username).orElse(BigDecimal.ZERO);

        return new UserStatsDto(
                userId,
                username,
                email,
                farms,
                fields,
                totalYield,
                avgYield
        );
    }
}
