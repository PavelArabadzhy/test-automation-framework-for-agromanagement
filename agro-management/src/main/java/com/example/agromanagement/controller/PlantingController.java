package com.example.agromanagement.controller;

import com.example.agromanagement.entity.Planting;
import com.example.agromanagement.service.CropService;
import com.example.agromanagement.service.FieldService;
import com.example.agromanagement.service.PlantingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/plantings")
public class PlantingController {

    private final PlantingService plantingService;
    private final FieldService fieldService;
    private final CropService cropService;

    @Autowired
    public PlantingController(PlantingService plantingService,
                              FieldService fieldService,
                              CropService cropService) {
        this.plantingService = plantingService;
        this.fieldService    = fieldService;
        this.cropService     = cropService;
    }

    /**
     * List current user's plantings.
     */
    @GetMapping
    public String listPlantings(Model model, Principal principal) {
        List<Planting> plantings = plantingService.getPlantingsByUsername(principal.getName());
        model.addAttribute("plantings", plantings);
        return "plantings/list";
    }

    /**
     * New planting form (only owned fields and crops).
     */
    @GetMapping("/add")
    public String showAddForm(Model model, Principal principal) {
        model.addAttribute("planting", new Planting());
        model.addAttribute("fields", fieldService.getFieldsByUsername(principal.getName()));
        model.addAttribute("crops",  cropService.getCropsByUsername(principal.getName()));
        return "plantings/form";
    }

    /**
     * Edit existing planting (owner-only).
     */
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id,
                               Model model,
                               Principal principal) {
        plantingService.getPlantingById(id).ifPresent(planting -> {
            if (planting.getField().getOwner().getUsername().equals(principal.getName())) {
                model.addAttribute("planting", planting);
                model.addAttribute("fields", fieldService.getFieldsByUsername(principal.getName()));
                model.addAttribute("crops",  cropService.getCropsByUsername(principal.getName()));
            }
        });
        return "plantings/form";
    }

    /**
     * Save planting (create/update) and bind to current user.
     */
    @PostMapping("/save")
    public String savePlanting(@ModelAttribute("planting") Planting planting,
                               Principal principal) {
        // Save planting and assign owner in service layer
        plantingService.savePlanting(planting, principal.getName());
        return "redirect:/plantings";
    }

    /**
     * Delete planting (owner-only).
     */
    @GetMapping("/delete/{id}")
    public String deletePlanting(@PathVariable Long id,
                                 Principal principal) {
        plantingService.deleteIfOwnedBy(id, principal.getName());
        return "redirect:/plantings";
    }
}
