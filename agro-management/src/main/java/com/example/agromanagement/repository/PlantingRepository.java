package com.example.agromanagement.repository;

import com.example.agromanagement.entity.Planting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlantingRepository extends JpaRepository<Planting, Long> {
    List<Planting> findByFieldOwnerUsername(String username);
}