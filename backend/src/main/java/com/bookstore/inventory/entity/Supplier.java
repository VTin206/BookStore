package com.bookstore.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
public class Supplier {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false, unique = true) private String name;
  @Column(name = "contact_name") private String contactName;
  private String phone;
  private String email;
  private String address;
  @Column(nullable = false) private boolean active = true;
  @Column(name = "created_at", nullable = false) private LocalDateTime createdAt = LocalDateTime.now();
  @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt = LocalDateTime.now();

  public Long getId() { return id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getContactName() { return contactName; }
  public void setContactName(String contactName) { this.contactName = contactName; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
}
