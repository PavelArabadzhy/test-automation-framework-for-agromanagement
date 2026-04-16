package com.example.agromanagement.controller.rest;

import com.example.agromanagement.entity.Crop;
import com.example.agromanagement.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/crops")
public class CropRestController {

    private final CropService cropService;

    @Autowired
    public CropRestController(CropService cropService) {
        this.cropService = cropService;
    }

    /**
     * Получить список культур текущего пользователя
     */
    @GetMapping
    public List<Crop> listCrops(Principal principal) {
        return cropService.getCropsByUsername(principal.getName());
    }

    /**
     * Получить культуру по ID (404 если нет, 403 если не владелец)
     */
    @GetMapping("/{id}")
    public Crop getCropById(@PathVariable Long id, Principal principal) {
        Crop crop = cropService.getCropById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Crop not found with id " + id));
        if (!crop.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Access denied");
        }
        return crop;
    }

    /**
     * Создать новую культуру
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Crop createCrop(@RequestBody Crop crop, Principal principal) {
        return cropService.saveCrop(crop, principal.getName());
    }

    /**
     * Обновить существующую культуру (404 или 403 при ошибках)
     */
    @PutMapping("/{id}")
    public Crop updateCrop(@PathVariable Long id,
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
        return cropService.saveCrop(crop, principal.getName());
    }

    /**
     * Удалить культуру (404 или 403 при ошибках)
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
