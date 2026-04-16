package com.example.agromanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "plantings")
public class Planting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "planting_date", nullable = false)
    private LocalDate plantingDate;

    @Column(name = "expected_harvest_date", nullable = false)
    private LocalDate expectedHarvestDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    public Planting() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getPlantingDate() { return plantingDate; }
    public void setPlantingDate(LocalDate plantingDate) { this.plantingDate = plantingDate; }

    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public void setExpectedHarvestDate(LocalDate expectedHarvestDate) { this.expectedHarvestDate = expectedHarvestDate; }

    public Field getField() { return field; }
    public void setField(Field field) { this.field = field; }

    public Crop getCrop() { return crop; }
    public void setCrop(Crop crop) { this.crop = crop; }
}