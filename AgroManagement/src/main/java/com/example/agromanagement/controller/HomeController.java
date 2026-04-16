package com.example.agromanagement.controller;

import com.example.agromanagement.service.HarvestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class HomeController {

    private final HarvestService harvestService;

    @Autowired
    public HomeController(HarvestService harvestService) {
        this.harvestService = harvestService;
    }

    @GetMapping("/")
    public String home(Model model, Principal principal) {
        if (principal != null) {
            // 1) Получаем карту месяц → средний урожай
            Map<Integer, BigDecimal> yieldByMonth = harvestService.getAverageYieldByMonth(principal.getName());

            // 2) Делаем из неё список меток (строк) и данных
            List<String> labels = yieldByMonth.keySet().stream()
                    .sorted()
                    .map(Object::toString)                            // месяц как строка
                    .collect(Collectors.toList());

            List<BigDecimal> data = labels.stream()
                    .map(s -> yieldByMonth.get(Integer.valueOf(s)))
                    .collect(Collectors.toList());

            model.addAttribute("yieldLabels", labels);
            model.addAttribute("yieldData", data);
        } else {
            // Аноним — отдаем пустые списки, Thymeleaf-блок для статистики всё равно скрыт
            model.addAttribute("yieldLabels", List.of());
            model.addAttribute("yieldData", List.of());
        }
        return "index";
    }
}
