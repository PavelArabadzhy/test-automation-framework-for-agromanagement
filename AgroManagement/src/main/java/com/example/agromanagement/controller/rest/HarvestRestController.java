package com.example.agromanagement.controller.rest;

import com.example.agromanagement.entity.Harvest;
import com.example.agromanagement.service.HarvestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/harvests")
public class HarvestRestController {

    private final HarvestService harvestService;

    @Autowired
    public HarvestRestController(HarvestService harvestService) {
        this.harvestService = harvestService;
    }

    /**
     * Список сборов текущего пользователя
     */
    @GetMapping
    public List<Harvest> listHarvests(Principal principal) {
        return harvestService.getHarvestsByUsername(principal.getName());
    }

    /**
     * Получить сбор по ID (404 если не найден, 403 если не владелец)
     */
    @GetMapping("/{id}")
    public Harvest getHarvestById(@PathVariable Long id, Principal principal) {
        Harvest harvest = harvestService.getHarvestById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Harvest not found with id " + id));
        if (!harvest.getPlanting().getField().getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return harvest;
    }

    /**
     * Создать новый сбор
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Harvest createHarvest(@RequestBody Harvest harvest, Principal principal) {
        // Предполагается, что planting в harvest содержит корректный ID поля с владельцем
        return harvestService.saveHarvest(harvest);
    }

    /**
     * Обновить сбор (404 или 403 при ошибках)
     */
    @PutMapping("/{id}")
    public Harvest updateHarvest(@PathVariable Long id,
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
        return harvestService.saveHarvest(harvest);
    }

    /**
     * Удалить сбор (404 или 403 при ошибках)
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