package com.example.agromanagement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "farms")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Farm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // New field
    @Column(nullable = true)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;

    public Farm() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // Getter/setter for location
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
