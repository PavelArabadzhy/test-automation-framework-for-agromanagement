package com.example.agromanagement.controller;

import com.example.agromanagement.dto.UserStatsDto;
import com.example.agromanagement.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // список
    @GetMapping("/users")
    public String listUsersStats(Model model) {
        model.addAttribute("userStats", adminService.getAllUsersStats());
        return "admin/users";
    }

    // показать форму редактирования
    @GetMapping("/users/{id}/edit")
    public String editUserForm(@PathVariable Long id, Model model) {
        UserStatsDto dto = adminService.findUserStatsById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + id));
        model.addAttribute("userDto", dto);
        return "admin/edit-user";
    }

    // сохранить изменения
    @PostMapping("/users/{id}/edit")
    public String updateUser(
            @PathVariable Long id,
            @ModelAttribute("userDto") UserStatsDto dto
    ) {
        dto.setUserId(id);
        adminService.updateUser(dto);
        return "redirect:/admin/users";
    }

    // редирект с корня админки
    @GetMapping
    public String adminRoot() {
        return "redirect:/admin/users";
    }
}

