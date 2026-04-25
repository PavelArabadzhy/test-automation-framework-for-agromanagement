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
     * List current user's fields.
     */
    @GetMapping
    public String listFields(Model model, Principal principal) {
        List<Field> fields = fieldService.getFieldsByUsername(principal.getName());
        model.addAttribute("fields", fields);
        return "fields/list";
    }

    /**
     * New field form.
     */
    @GetMapping("/add")
    public String showAddForm(Model model, Principal principal) {
        model.addAttribute("field", new Field());
        model.addAttribute("farms", farmService.getFarmsByUsername(principal.getName()));
        return "fields/form";
    }

    /**
     * Edit existing field (owner-only).
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
     * Save field (create/update) and bind to current user.
     */
    @PostMapping("/save")
    public String saveField(@ModelAttribute("field") Field field,
                            Principal principal) {
        // Save field and assign owner in service layer
        fieldService.saveField(field, principal.getName());
        return "redirect:/fields";
    }

    /**
     * Delete field (owner-only).
     */
    @GetMapping("/delete/{id}")
    public String deleteField(@PathVariable("id") Long id,
                              Principal principal) {
        fieldService.deleteIfOwnedBy(id, principal.getName());
        return "redirect:/fields";
    }
}
