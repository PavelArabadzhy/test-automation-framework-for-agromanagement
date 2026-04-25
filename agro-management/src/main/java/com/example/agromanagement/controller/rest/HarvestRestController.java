package com.example.agromanagement.controller.rest;

import com.example.agromanagement.controller.rest.dto.DomainDtoMapper;
import com.example.agromanagement.controller.rest.dto.DomainDtos;
import com.example.agromanagement.entity.Harvest;
import com.example.agromanagement.service.HarvestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(value = "/api/harvests", produces = MediaType.APPLICATION_JSON_VALUE)
public class HarvestRestController {

    private final HarvestService harvestService;

    @Autowired
    public HarvestRestController(HarvestService harvestService) {
        this.harvestService = harvestService;
    }

    /**
     * List harvest entries for the current user.
     */
    @GetMapping
    public List<DomainDtos.HarvestDto> listHarvests(Principal principal) {
        return harvestService.getHarvestsByUsername(principal.getName()).stream()
                .map(DomainDtoMapper::toHarvestDto)
                .toList();
    }

    /**
     * Get harvest by ID (404 if missing, 403 if not owner).
     */
    @GetMapping("/{id}")
    public DomainDtos.HarvestDto getHarvestById(@PathVariable Long id, Principal principal) {
        Harvest harvest = harvestService.getHarvestById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Harvest not found with id " + id));
        if (!harvest.getPlanting().getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return DomainDtoMapper.toHarvestDto(harvest);
    }

    /**
     * Create a new harvest entry.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DomainDtos.HarvestDto createHarvest(@RequestBody Harvest harvest, Principal principal) {
        // Assumes harvest.planting references a valid owner-linked field ID.
        return DomainDtoMapper.toHarvestDto(harvestService.saveHarvest(harvest));
    }

    /**
     * Update harvest entry (404 or 403 on errors).
     */
    @PutMapping("/{id}")
    public DomainDtos.HarvestDto updateHarvest(@PathVariable Long id,
                                               @RequestBody Harvest harvest,
                                               Principal principal) {
        Harvest existing = harvestService.getHarvestById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Harvest not found with id " + id));
        if (!existing.getPlanting().getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        harvest.setId(id);
        return DomainDtoMapper.toHarvestDto(harvestService.saveHarvest(harvest));
    }

    /**
     * Delete harvest entry (404 or 403 on errors).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteHarvest(@PathVariable Long id, Principal principal) {
        Harvest existing = harvestService.getHarvestById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Harvest not found with id " + id));
        if (!existing.getPlanting().getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        harvestService.deleteIfOwnedBy(id, principal.getName());
    }
}