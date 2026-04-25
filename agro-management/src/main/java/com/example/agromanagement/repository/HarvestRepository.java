package com.example.agromanagement.repository;

import com.example.agromanagement.entity.Harvest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface HarvestRepository extends JpaRepository<Harvest, Long> {

    /**
     * Returns [month, averageYield] rows for each month,
     * where month is an integer from 1 to 12.
     */
    @Query("""
        SELECT MONTH(h.harvestDate)      AS m,
               AVG(h.yieldAmount)       AS avgYield
          FROM Harvest h
         WHERE h.planting.field.owner.username = :username
      GROUP BY MONTH(h.harvestDate)
      ORDER BY MONTH(h.harvestDate)
      """)
    List<Object[]> findAvgYieldByMonth(@Param("username") String username);

    List<Harvest> findByPlantingFieldOwnerUsername(String username);

        @Query("select sum(h.yieldAmount) from Harvest h where h.planting.field.owner.username = :username")
        Optional<BigDecimal> sumYieldByUsername(@Param("username") String username);

        @Query("select avg(h.yieldAmount) from Harvest h where h.planting.field.owner.username = :username")
        Optional<BigDecimal> avgYieldByUsername(@Param("username") String username);
}

