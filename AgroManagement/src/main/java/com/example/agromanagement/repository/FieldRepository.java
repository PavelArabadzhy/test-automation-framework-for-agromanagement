package com.example.agromanagement.repository;

import com.example.agromanagement.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, Long> {
    List<Field> findByOwnerUsername(String username);
    long countByOwnerUsername(String username);
}