// com/example/agromanagement/service/HarvestService.java
package com.example.agromanagement.service;

import com.example.agromanagement.entity.Harvest;
import com.example.agromanagement.entity.Planting;
import com.example.agromanagement.repository.HarvestRepository;
import com.example.agromanagement.repository.PlantingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HarvestService {

    private final HarvestRepository harvestRepository;
    private final PlantingRepository plantingRepository;
    private Object LinkedHashMap;

    @Autowired
    public HarvestService(HarvestRepository harvestRepository,
                          PlantingRepository plantingRepository) {
        this.harvestRepository    = harvestRepository;
        this.plantingRepository   = plantingRepository;
    }

    public List<Harvest> getHarvestsByUsername(String username) {
        return harvestRepository.findByPlantingFieldOwnerUsername(username);
    }

    public Optional<Harvest> getHarvestById(Long id) {
        return harvestRepository.findById(id);
    }

    public Harvest saveHarvest(Harvest harvest) {
        if (harvest.getPlanting() == null || harvest.getPlanting().getId() == null) {
            throw new IllegalArgumentException("Посів не вибраний (ID = null)");
        }
        Long plantingId = harvest.getPlanting().getId();
        Planting realPlanting = plantingRepository.findById(plantingId)
                .orElseThrow(() -> new IllegalArgumentException("Невірний ID посіву: " + plantingId));
        harvest.setPlanting(realPlanting);
        harvest.setOwner(realPlanting.getField().getOwner());
        return harvestRepository.save(harvest);
    }
    public Map<Integer, BigDecimal> getAverageYieldByMonth(String username) {
        List<Object[]> rows = harvestRepository.findAvgYieldByMonth(username);
        return rows.stream()
                .collect(Collectors.toMap(
                        r -> ((Number) r[0]).intValue(),                              // месяц
                        r -> BigDecimal.valueOf(((Number) r[1]).doubleValue()),       // конвертация
                        (a,b)->b,
                        LinkedHashMap::new
                ));
    }
    public void deleteIfOwnedBy(Long harvestId, String username) {
        harvestRepository.findById(harvestId).ifPresent(h -> {
            if (h.getOwner().getUsername().equals(username)) {
                harvestRepository.delete(h);
            }
        });
    }
}
