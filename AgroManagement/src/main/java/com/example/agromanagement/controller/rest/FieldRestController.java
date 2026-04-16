package com.example.agromanagement.controller.rest;

import com.example.agromanagement.entity.Field;
import com.example.agromanagement.service.FieldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

/**
 * REST контроллер для управления полями пользователя
 */
@RestController
@RequestMapping("/api/fields")
public class FieldRestController {

    private final FieldService fieldService;

    @Autowired
    public FieldRestController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    /**
     * Получить список полей текущего пользователя
     */
    @GetMapping
    public List<Field> listFields(Principal principal) {
        return fieldService.getFieldsByUsername(principal.getName());
    }

    /**
     * Получить поле по ID (404 если нет, 403 если не владелец)
     */
    @GetMapping("/{id}")
    public Field getFieldById(@PathVariable Long id, Principal principal) {
        Field field = fieldService.getFieldById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Field not found with id " + id));
        if (!field.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return field;
    }

    /**
     * Создать новое поле
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Field createField(@RequestBody Field field, Principal principal) {
        return fieldService.saveField(field, principal.getName());
    }

    /**
     * Обновить существующее поле (404 или 403 при ошибках)
     */
    @PutMapping("/{id}")
    public Field updateField(@PathVariable Long id,
                             @RequestBody Field field,
                             Principal principal) {
        Field existing = fieldService.getFieldById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Field not found with id " + id));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        field.setId(id);
        return fieldService.saveField(field, principal.getName());
    }

    /**
     * Удалить поле (404 или 403 при ошибках)
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteField(@PathVariable Long id, Principal principal) {
        Field existing = fieldService.getFieldById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Field not found with id " + id));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        fieldService.deleteIfOwnedBy(id, principal.getName());
    }
}