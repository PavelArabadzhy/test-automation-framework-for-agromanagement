package com.example.agromanagement.controller.rest;

import com.example.agromanagement.controller.rest.dto.DomainDtoMapper;
import com.example.agromanagement.controller.rest.dto.DomainDtos;
import com.example.agromanagement.entity.Crop;
import com.example.agromanagement.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(value = "/api/crops", produces = MediaType.APPLICATION_JSON_VALUE)
public class CropRestController {

    private final CropService cropService;

    @Autowired
    public CropRestController(CropService cropService) {
        this.cropService = cropService;
    }

    /**
     * Get current user's crop list.
     */
    @GetMapping
    public List<DomainDtos.CropDto> listCrops(Principal principal) {
        return cropService.getCropsByUsername(principal.getName()).stream()
                .map(DomainDtoMapper::toCropDto)
                .toList();
    }

    /**
     * Get crop by ID (404 if missing, 403 if not owner).
     */
    @GetMapping("/{id}")
    public DomainDtos.CropDto getCropById(@PathVariable Long id, Principal principal) {
        Crop crop = cropService.getCropById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Crop not found with id " + id));
        if (!crop.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return DomainDtoMapper.toCropDto(crop);
    }

    /**
     * Create a new crop.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DomainDtos.CropDto createCrop(@RequestBody Crop crop, Principal principal) {
        return DomainDtoMapper.toCropDto(cropService.saveCrop(crop, principal.getName()));
    }

    /**
     * Update existing crop (404 or 403 on errors).
     */
    @PutMapping("/{id}")
    public DomainDtos.CropDto updateCrop(@PathVariable Long id,
                                         @RequestBody Crop crop,
                                         Principal principal) {
        Crop existing = cropService.getCropById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Crop not found with id " + id));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        crop.setId(id);
        return DomainDtoMapper.toCropDto(cropService.saveCrop(crop, principal.getName()));
    }

    /**
     * Delete crop (404 or 403 on errors).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCrop(@PathVariable Long id, Principal principal) {
        Crop existing = cropService.getCropById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Crop not found with id " + id));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        cropService.deleteIfOwnedBy(id, principal.getName());
    }
}
