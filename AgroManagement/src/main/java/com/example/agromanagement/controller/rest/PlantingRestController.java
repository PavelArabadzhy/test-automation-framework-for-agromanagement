package com.example.agromanagement.controller.rest;

import com.example.agromanagement.entity.Planting;
import com.example.agromanagement.service.PlantingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/plantings")
public class PlantingRestController {

    private final PlantingService plantingService;

    @Autowired
    public PlantingRestController(PlantingService plantingService) {
        this.plantingService = plantingService;
    }

    /**
     * Список посевов текущего пользователя
     */
    @GetMapping
    public List<Planting> listPlantings(Principal principal) {
        return plantingService.getPlantingsByUsername(principal.getName());
    }

    /**
     * Получить посев по ID (404 если нет, 403 если не владелец)
     */
    @GetMapping("/{id}")
    public Planting getPlantingById(@PathVariable Long id, Principal principal) {
        Planting planting = plantingService.getPlantingById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Planting not found with id " + id));
        if (!planting.getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return planting;
    }

    /**
     * Создать новый посев
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Planting createPlanting(@RequestBody Planting planting, Principal principal) {
        return plantingService.savePlanting(planting, principal.getName());
    }

    /**
     * Обновить существующий посев (404 или 403 при ошибках)
     */
    @PutMapping("/{id}")
    public Planting updatePlanting(@PathVariable Long id,
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
        return plantingService.savePlanting(planting, principal.getName());
    }

    /**
     * Удалить посев (404 или 403 при ошибках)
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