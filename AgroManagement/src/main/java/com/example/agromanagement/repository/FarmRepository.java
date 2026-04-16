package com.example.agromanagement.repository;

import com.example.agromanagement.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmRepository extends JpaRepository<Farm, Long> {
    List<Farm> findByOwnerUsername(String username);
    long countByOwnerUsername(String username);
}
