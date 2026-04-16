package com.example.agromanagement.controller;

import com.example.agromanagement.entity.Farm;
import com.example.agromanagement.service.FarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/farms")
public class FarmController {

    private final FarmService farmService;

    @Autowired
    public FarmController(FarmService farmService) {
        this.farmService = farmService;
    }

    /**
     * Список ферм текущего пользователя
     */
    @GetMapping
    public String listFarms(Model model, Principal principal) {
        List<Farm> farms = farmService.getFarmsByUsername(principal.getName());
        model.addAttribute("farms", farms);
        return "farms/list";
    }

    /**
     * Форма добавления новой фермы
     */
    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("farm", new Farm());
        return "farms/form";
    }

    /**
     * Форма редактирования существующей фермы (только свои)
     */
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Long id,
                               Model model,
                               Principal principal) {
        farmService.getFarmById(id).ifPresent(farm -> {
            if (farm.getOwner().getUsername().equals(principal.getName())) {
                model.addAttribute("farm", farm);
            }
        });
        return "farms/form";
    }

    /**
     * Сохранение (создание/обновление) с привязкой к текущему пользователю
     */
    @PostMapping("/save")
    public String saveFarm(@ModelAttribute("farm") Farm farm,
                           Principal principal) {
        farmService.saveFarm(farm, principal.getName());
        return "redirect:/farms";
    }

    /**
     * Удаление (только своих ферм)
     */
    @GetMapping("/delete/{id}")
    public String deleteFarm(@PathVariable("id") Long id,
                             Principal principal) {
        farmService.deleteIfOwnedBy(id, principal.getName());
        return "redirect:/farms";
    }
}