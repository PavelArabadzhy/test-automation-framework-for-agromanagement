package com.example.agromanagement.controller.rest;

import com.example.agromanagement.controller.rest.dto.DomainDtoMapper;
import com.example.agromanagement.controller.rest.dto.DomainDtos;
import com.example.agromanagement.entity.Field;
import com.example.agromanagement.service.FieldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for managing user fields.
 */
@RestController
@RequestMapping(value = "/api/fields", produces = MediaType.APPLICATION_JSON_VALUE)
public class FieldRestController {

    private final FieldService fieldService;

    @Autowired
    public FieldRestController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    /**
     * Get current user's field list.
     */
    @GetMapping
    public List<DomainDtos.FieldDto> listFields(Principal principal) {
        return fieldService.getFieldsByUsername(principal.getName()).stream()
                .map(DomainDtoMapper::toFieldDto)
                .toList();
    }

    /**
     * Get field by ID (404 if missing, 403 if not owner).
     */
    @GetMapping("/{id}")
    public DomainDtos.FieldDto getFieldById(@PathVariable Long id, Principal principal) {
        Field field = fieldService.getFieldById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Field not found with id " + id));
        if (!field.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return DomainDtoMapper.toFieldDto(field);
    }

    /**
     * Create a new field.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DomainDtos.FieldDto createField(@RequestBody Field field, Principal principal) {
        return DomainDtoMapper.toFieldDto(fieldService.saveField(field, principal.getName()));
    }

    /**
     * Update existing field (404 or 403 on errors).
     */
    @PutMapping("/{id}")
    public DomainDtos.FieldDto updateField(@PathVariable Long id,
                                           @RequestBody Field field,
                                           Principal principal) {
        Field existing = fieldService.getFieldById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Field not found with id " + id));
        if (!existing.getOwner().getUsername().equals(principal.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        field.setId(id);
        return DomainDtoMapper.toFieldDto(fieldService.saveField(field, principal.getName()));
    }

    /**
     * Delete field (404 or 403 on errors).
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