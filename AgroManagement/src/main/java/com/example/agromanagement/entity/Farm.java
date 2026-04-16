package com.example.agromanagement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farms")
public class Farm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // ← новое поле
    @Column(nullable = true)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    public Farm() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // ← геттер/сеттер для location
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
