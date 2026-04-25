package com.example.agromanagement.controller.rest.dto;

import com.example.agromanagement.entity.Crop;
import com.example.agromanagement.entity.Farm;
import com.example.agromanagement.entity.Field;
import com.example.agromanagement.entity.Harvest;
import com.example.agromanagement.entity.Planting;

public final class DomainDtoMapper {
    private DomainDtoMapper() {
    }

    public static DomainDtos.FarmDto toFarmDto(Farm farm) {
        return new DomainDtos.FarmDto(farm.getId(), farm.getName(), farm.getLocation());
    }

    public static DomainDtos.FieldDto toFieldDto(Field field) {
        Long farmId = field.getFarm() != null ? field.getFarm().getId() : null;
        return new DomainDtos.FieldDto(
                field.getId(),
                field.getName(),
                field.getArea(),
                new DomainDtos.IdRefDto(farmId)
        );
    }

    public static DomainDtos.CropDto toCropDto(Crop crop) {
        return new DomainDtos.CropDto(crop.getId(), crop.getName(), crop.getExpectedYield());
    }

    public static DomainDtos.PlantingDto toPlantingDto(Planting planting) {
        Long fieldId = planting.getField() != null ? planting.getField().getId() : null;
        Long cropId = planting.getCrop() != null ? planting.getCrop().getId() : null;
        return new DomainDtos.PlantingDto(
                planting.getId(),
                planting.getPlantingDate(),
                planting.getExpectedHarvestDate(),
                new DomainDtos.IdRefDto(fieldId),
                new DomainDtos.IdRefDto(cropId)
        );
    }

    public static DomainDtos.HarvestDto toHarvestDto(Harvest harvest) {
        Long plantingId = harvest.getPlanting() != null ? harvest.getPlanting().getId() : null;
        return new DomainDtos.HarvestDto(
                harvest.getId(),
                harvest.getHarvestDate(),
                harvest.getYieldAmount(),
                new DomainDtos.IdRefDto(plantingId)
        );
    }
}
