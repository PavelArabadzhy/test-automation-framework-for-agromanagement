package com.example.agromanagement.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "harvests")
public class Harvest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Связь с записями посева.
     * Считаем, что Planting — это ваша сущность посева.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planting_id", nullable = false)
    private Planting planting;

    /**
     * Дата сбора урожая
     */
    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    /**
     * Количество урожая (тонн)
     */
    @Column(name = "yield_amount", precision = 38, scale = 2, nullable = false)
    private BigDecimal yieldAmount;

    /**
     * Владелец (тот же тип, что и в Field.getOwner())
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // ------------------------------------------------------------------------
    // Конструкторы
    // ------------------------------------------------------------------------

    public Harvest() {
    }

    public Harvest(Planting planting, LocalDate harvestDate, BigDecimal yieldAmount, User owner) {
        this.planting = planting;
        this.harvestDate = harvestDate;
        this.yieldAmount = yieldAmount;
        this.owner = owner;
    }

    // ------------------------------------------------------------------------
    // Геттеры и сеттеры
    // ------------------------------------------------------------------------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Planting getPlanting() {
        return planting;
    }

    public void setPlanting(Planting planting) {
        this.planting = planting;
    }

    public LocalDate getHarvestDate() {
        return harvestDate;
    }

    public void setHarvestDate(LocalDate harvestDate) {
        this.harvestDate = harvestDate;
    }

    public BigDecimal getYieldAmount() {
        return yieldAmount;
    }

    public void setYieldAmount(BigDecimal yieldAmount) {
        this.yieldAmount = yieldAmount;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    // ------------------------------------------------------------------------
    // equals / hashCode / toString (по желанию)
    // ------------------------------------------------------------------------

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Harvest)) return false;
        Harvest other = (Harvest) o;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "Harvest{" +
                "id=" + id +
                ", planting=" + (planting != null ? planting.getId() : null) +
                ", harvestDate=" + harvestDate +
                ", yieldAmount=" + yieldAmount +
                ", owner=" + (owner != null ? owner.getUsername() : null) +
                '}';
    }
}
