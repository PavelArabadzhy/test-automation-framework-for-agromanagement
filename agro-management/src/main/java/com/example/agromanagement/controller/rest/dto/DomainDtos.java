package com.example.agromanagement.controller.rest.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class DomainDtos {
    private DomainDtos() {
    }

    public record IdRefDto(Long id) {
    }

    public record FarmDto(Long id, String name, String location) {
    }

    public record FieldDto(Long id, String name, Double area, IdRefDto farm) {
    }

    public record CropDto(Long id, String name, Double expectedYield) {
    }

    public record PlantingDto(
            Long id,
            LocalDate plantingDate,
            LocalDate expectedHarvestDate,
            IdRefDto field,
            IdRefDto crop
    ) {
    }

    public record HarvestDto(
            Long id,
            LocalDate harvestDate,
            BigDecimal yieldAmount,
            IdRefDto planting
    ) {
    }
}
