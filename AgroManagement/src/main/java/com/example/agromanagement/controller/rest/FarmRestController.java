package com.example.agromanagement.controller.rest;

import com.example.agromanagement.entity.Farm;
import com.example.agromanagement.service.FarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/farms")
public class FarmRestController {

    private final FarmService farmService;

    @Autowired
    public FarmRestController(FarmService farmService) {
        this.farmService = farmService;
    }

    /**
     * Получить список ферм текущего пользователя
     */
    @GetMapping
    public List<Farm> listFarms(Principal principal) {
        return farmService.getFarmsByUsername(principal.getName());
    }

    /**
     * Получить ферму по ID (404 если нет, 403 если не владелец)
     */
    @GetMapping("/{id}")
    public Farm getFarmById(@PathVariable Long id, Principal principal) {
        Farm farm = farmService.getFarmById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Farm not found with id " + id));
        if (!farm.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return farm;
    }

    /**
     * Создать новую ферму
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Farm createFarm(@RequestBody Farm farm, Principal principal) {
        return farmService.saveFarm(farm, principal.getName());
    }

    /**
     * Обновить существующую ферму (404 или 403 при ошибках)
     */
    @PutMapping("/{id}")
    public Farm updateFarm(@PathVariable Long id,
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
        return farmService.saveFarm(farm, principal.getName());
    }

    /**
     * Удалить ферму (404 или 403 при ошибках)
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