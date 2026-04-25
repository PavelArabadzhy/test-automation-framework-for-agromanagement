package com.example.agromanagement.dto;

import java.math.BigDecimal;

public class UserStatsDto {

    private Long userId;
    private String username;
    private String email;
    private long farmsCount;
    private long fieldsCount;
    private BigDecimal totalYield;
    private BigDecimal avgYield;

    // 1) Empty constructor for Thymeleaf
    public UserStatsDto() {
    }

    // 2) Convenience constructor for list assembly
    public UserStatsDto(Long userId, String username, String email,
                        long farmsCount, long fieldsCount,
                        BigDecimal totalYield, BigDecimal avgYield) {
        this.userId      = userId;
        this.username    = username;
        this.email       = email;
        this.farmsCount  = farmsCount;
        this.fieldsCount = fieldsCount;
        this.totalYield  = totalYield;
        this.avgYield    = avgYield;
    }

    // Getters
    public Long getUserId()       { return userId; }
    public String getUsername()   { return username; }
    public String getEmail()      { return email; }
    public long getFarmsCount()   { return farmsCount; }
    public long getFieldsCount()  { return fieldsCount; }
    public BigDecimal getTotalYield() { return totalYield; }
    public BigDecimal getAvgYield()   { return avgYield; }

    // Setters
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFarmsCount(long farmsCount) {
        this.farmsCount = farmsCount;
    }

    public void setFieldsCount(long fieldsCount) {
        this.fieldsCount = fieldsCount;
    }

    public void setTotalYield(BigDecimal totalYield) {
        this.totalYield = totalYield;
    }

    public void setAvgYield(BigDecimal avgYield) {
        this.avgYield = avgYield;
    }
}
