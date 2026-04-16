package com.example.agromanagement.repository;

import com.example.agromanagement.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByOwnerUsername(String username);
}