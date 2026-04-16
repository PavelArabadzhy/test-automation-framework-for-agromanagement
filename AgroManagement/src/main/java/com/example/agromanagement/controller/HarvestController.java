// com/example/agromanagement/controller/HarvestController.java
package com.example.agromanagement.controller;

import com.example.agromanagement.entity.Harvest;
import com.example.agromanagement.entity.Planting;
import com.example.agromanagement.service.HarvestService;
import com.example.agromanagement.service.PlantingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@Controller
@RequestMapping("/harvests")
public class HarvestController {

    private final HarvestService harvestService;
    private final PlantingService plantingService;

    @Autowired
    public HarvestController(HarvestService harvestService,
                             PlantingService plantingService) {
        this.harvestService = harvestService;
        this.plantingService = plantingService;
    }

    /** Список сборов текущего пользователя */
    @GetMapping
    public String listHarvests(Model model, Principal principal) {
        model.addAttribute("harvests",
                harvestService.getHarvestsByUsername(principal.getName()));
        return "harvests/list";
    }

    /** Форма добавления нового сбора */
    @GetMapping("/add")
    public String showAddForm(Model model, Principal principal) {
        Harvest harvest = new Harvest();
        harvest.setPlanting(new Planting());   // ← вот это важно
        model.addAttribute("harvest", harvest);
        model.addAttribute("plantings",
                plantingService.getPlantingsByUsername(principal.getName()));
        return "harvests/form";
    }

    /** Форма редактирования (только свои) */
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id,
                               Model model,
                               Principal principal) {
        Optional<Harvest> opt = harvestService.getHarvestById(id);
        if (opt.isPresent()) {
            Harvest h = opt.get();
            // Проверяем владельца
            if (h.getOwner().getUsername().equals(principal.getName())) {
                model.addAttribute("harvest", h);
                model.addAttribute("plantings",
                        plantingService.getPlantingsByUsername(principal.getName()));
                return "harvests/form";
            }
        }
        return "redirect:/harvests";
    }

    /** Сохранение (создание/обновление) */
    @PostMapping("/save")
    public String saveHarvest(@ModelAttribute("harvest") Harvest harvest) {
        harvestService.saveHarvest(harvest);
        return "redirect:/harvests";
    }

    /** Удаление (только свои) */
    @GetMapping("/delete/{id}")
    public String deleteHarvest(@PathVariable Long id,
                                Principal principal) {
        harvestService.deleteIfOwnedBy(id, principal.getName());
        return "redirect:/harvests";
    }
}
