package com.example.agromanagement.controller.rest;

import com.example.agromanagement.controller.rest.dto.DomainDtoMapper;
import com.example.agromanagement.controller.rest.dto.DomainDtos;
import com.example.agromanagement.entity.Farm;
import com.example.agromanagement.service.FarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(value = "/api/farms", produces = MediaType.APPLICATION_JSON_VALUE)
public class FarmRestController {

    private final FarmService farmService;

    @Autowired
    public FarmRestController(FarmService farmService) {
        this.farmService = farmService;
    }

    /**
     * Get current user's farm list.
     */
    @GetMapping
    public List<DomainDtos.FarmDto> listFarms(Principal principal) {
        return farmService.getFarmsByUsername(principal.getName()).stream()
                .map(DomainDtoMapper::toFarmDto)
                .toList();
    }

    /**
     * Get farm by ID (404 if missing, 403 if not owner).
     */
    @GetMapping("/{id}")
    public DomainDtos.FarmDto getFarmById(@PathVariable Long id, Principal principal) {
        Farm farm = farmService.getFarmById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Farm not found with id " + id));
        if (!farm.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return DomainDtoMapper.toFarmDto(farm);
    }

    /**
     * Create a new farm.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DomainDtos.FarmDto createFarm(@RequestBody Farm farm, Principal principal) {
        return DomainDtoMapper.toFarmDto(farmService.saveFarm(farm, principal.getName()));
    }

    /**
     * Update existing farm (404 or 403 on errors).
     */
    @PutMapping("/{id}")
    public DomainDtos.FarmDto updateFarm(@PathVariable Long id,
                                         @RequestBody Farm farm,
                                         Principal principal) {
        Farm existing = farmService.getFarmById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Farm not found with id " + id));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        farm.setId(id);
        return DomainDtoMapper.toFarmDto(farmService.saveFarm(farm, principal.getName()));
    }

    /**
     * Delete farm (404 or 403 on errors).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFarm(@PathVariable Long id, Principal principal) {
        Farm existing = farmService.getFarmById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Farm not found with id " + id));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        farmService.deleteIfOwnedBy(id, principal.getName());
    }
}