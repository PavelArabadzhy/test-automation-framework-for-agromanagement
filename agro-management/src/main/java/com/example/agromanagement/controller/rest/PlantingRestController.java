package com.example.agromanagement.controller.rest;

import com.example.agromanagement.controller.rest.dto.DomainDtoMapper;
import com.example.agromanagement.controller.rest.dto.DomainDtos;
import com.example.agromanagement.entity.Planting;
import com.example.agromanagement.service.PlantingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(value = "/api/plantings", produces = MediaType.APPLICATION_JSON_VALUE)
public class PlantingRestController {

    private final PlantingService plantingService;

    @Autowired
    public PlantingRestController(PlantingService plantingService) {
        this.plantingService = plantingService;
    }

    /**
     * List current user's plantings.
     */
    @GetMapping
    public List<DomainDtos.PlantingDto> listPlantings(Principal principal) {
        return plantingService.getPlantingsByUsername(principal.getName()).stream()
                .map(DomainDtoMapper::toPlantingDto)
                .toList();
    }

    /**
     * Get planting by ID (404 if missing, 403 if not owner).
     */
    @GetMapping("/{id}")
    public DomainDtos.PlantingDto getPlantingById(@PathVariable Long id, Principal principal) {
        Planting planting = plantingService.getPlantingById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Planting not found with id " + id));
        if (!planting.getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return DomainDtoMapper.toPlantingDto(planting);
    }

    /**
     * Create a new planting.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DomainDtos.PlantingDto createPlanting(@RequestBody Planting planting, Principal principal) {
        return DomainDtoMapper.toPlantingDto(plantingService.savePlanting(planting, principal.getName()));
    }

    /**
     * Update existing planting (404 or 403 on errors).
     */
    @PutMapping("/{id}")
    public DomainDtos.PlantingDto updatePlanting(@PathVariable Long id,
                                                 @RequestBody Planting planting,
                                                 Principal principal) {
        Planting existing = plantingService.getPlantingById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Planting not found with id " + id));
        if (!existing.getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        planting.setId(id);
        return DomainDtoMapper.toPlantingDto(plantingService.savePlanting(planting, principal.getName()));
    }

    /**
     * Delete planting (404 or 403 on errors).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlanting(@PathVariable Long id, Principal principal) {
        Planting existing = plantingService.getPlantingById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Planting not found with id " + id));
        if (!existing.getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        plantingService.deleteIfOwnedBy(id, principal.getName());
    }
}