package com.example.agromanagement.controller;

import com.example.agromanagement.entity.Crop;
import com.example.agromanagement.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/crops")
public class CropController {

    private final CropService cropService;

    @Autowired
    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    /**
     * List current user's crops.
     */
    @GetMapping
    public String listCrops(Model model, Principal principal) {
        List<Crop> crops = cropService.getCropsByUsername(principal.getName());
        model.addAttribute("crops", crops);
        return "crops/list";
    }

    /**
     * New crop form.
     */
    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("crop", new Crop());
        return "crops/form";
    }

    /**
     * Edit existing crop (owner-only).
     */
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable("id") Long id,
                               Model model,
                               Principal principal) {
        cropService.getCropById(id).ifPresent(crop -> {
            if (crop.getOwner().getUsername().equals(principal.getName())) {
                model.addAttribute("crop", crop);
            }
        });
        return "crops/form";
    }

    /**
     * Save crop (create/update), bound to current user.
     */
    @PostMapping("/save")
    public String saveCrop(@ModelAttribute("crop") Crop crop,
                           Principal principal) {
        cropService.saveCrop(crop, principal.getName());
        return "redirect:/crops";
    }

    /**
     * Delete crop (owner-only).
     */
    @GetMapping("/delete/{id}")
    public String deleteCrop(@PathVariable("id") Long id,
                             Principal principal) {
        cropService.deleteIfOwnedBy(id, principal.getName());
        return "redirect:/crops";
    }
}
