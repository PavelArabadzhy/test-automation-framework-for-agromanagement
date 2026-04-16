package com.example.agromanagement.controller;

import com.example.agromanagement.entity.Field;
import com.example.agromanagement.service.FieldService;
import com.example.agromanagement.service.FarmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/fields")
public class FieldController {

    private final FieldService fieldService;
    private final FarmService farmService;

    @Autowired
    public FieldController(FieldService fieldService, FarmService farmService) {
        this.fieldService = fieldService;
        this.farmService  = farmService;
    }

    /**
     * Список полей текущего пользователя
     */
    @GetMapping
    public String listFields(Model model, Principal principal) {
        List<Field> fields = fieldService.getFieldsByUsername(principal.getName());
        model.addAttribute("fields", fields);
        return "fields/list";
    }

    /**
     * Форма добавления нового поля
     */
    @GetMapping("/add")
    public String showAddForm(Model model, Principal principal) {
        model.addAttribute("field", new Field());
        model.addAttribute("farms", farmService.getFarmsByUsername(principal.getName()));
        return "fields/form";
    }

    /**
     * Форма редактирования существующего поля (только свои поля)
     */
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Long id,
                               Model model,
                               Principal principal) {
        fieldService.getFieldById(id).ifPresent(field -> {
            if (field.getOwner().getUsername().equals(principal.getName())) {
                model.addAttribute("field", field);
                model.addAttribute("farms", farmService.getFarmsByUsername(principal.getName()));
            }
        });
        return "fields/form";
    }

    /**
     * Сохранение (создание/обновление) поля с привязкой к текущему пользователю
     */
    @PostMapping("/save")
    public String saveField(@ModelAttribute("field") Field field,
                            Principal principal) {
        // Сохраняем поле, привязывая владельца внутри сервиса
        fieldService.saveField(field, principal.getName());
        return "redirect:/fields";
    }

    /**
     * Удаление поля (только своих полей)
     */
    @GetMapping("/delete/{id}")
    public String deleteField(@PathVariable("id") Long id,
                              Principal principal) {
        fieldService.deleteIfOwnedBy(id, principal.getName());
        return "redirect:/fields";
    }
}
