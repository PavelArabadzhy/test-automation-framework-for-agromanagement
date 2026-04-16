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
     * Список посевов текущего пользователя
     */
    @GetMapping
    public String listPlantings(Model model, Principal principal) {
        List<Planting> plantings = plantingService.getPlantingsByUsername(principal.getName());
        model.addAttribute("plantings", plantings);
        return "plantings/list";
    }

    /**
     * Форма добавления нового посева (только свои поля и культуры)
     */
    @GetMapping("/add")
    public String showAddForm(Model model, Principal principal) {
        model.addAttribute("planting", new Planting());
        model.addAttribute("fields", fieldService.getFieldsByUsername(principal.getName()));
        model.addAttribute("crops",  cropService.getCropsByUsername(principal.getName()));
        return "plantings/form";
    }

    /**
     * Форма редактирования существующего посева (только свои)
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
     * Сохранение (создание/обновление) посева с привязкой к текущему пользователю
     */
    @PostMapping("/save")
    public String savePlanting(@ModelAttribute("planting") Planting planting,
                               Principal principal) {
        // Сохраняем посев и привязываем владельца внутри сервиса
        plantingService.savePlanting(planting, principal.getName());
        return "redirect:/plantings";
    }

    /**
     * Удаление посева (только своих)
     */
    @GetMapping("/delete/{id}")
    public String deletePlanting(@PathVariable Long id,
                                 Principal principal) {
        plantingService.deleteIfOwnedBy(id, principal.getName());
        return "redirect:/plantings";
    }
}
