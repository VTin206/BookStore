package com.bookstore.order.entity;

import com.bookstore.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(name = "customer_name", nullable = false)
  private String customerName;

  @Column(name = "customer_email", nullable = false)
  private String customerEmail;

  @Column(name = "shipping_address")
  private String shippingAddress;

  private String phone;
  private String note;

  @Column(name = "shipping_fee", nullable = false)
  private BigDecimal shippingFee = BigDecimal.ZERO;

  @Column(name = "total_amount", nullable = false)
  private BigDecimal totalAmount;

  @Column(nullable = false)
  private String status = "PENDING";

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
  private List<OrderItem> items = new ArrayList<>();

  public Long getId() { return id; }
  public User getUser() { return user; }
  public void setUser(User value) { user = value; }
  public String getCustomerName() { return customerName; }
  public void setCustomerName(String value) { customerName = value; }
  public String getCustomerEmail() { return customerEmail; }
  public void setCustomerEmail(String value) { customerEmail = value; }
  public String getShippingAddress() { return shippingAddress; }
  public void setShippingAddress(String value) { shippingAddress = value; }
  public String getPhone() { return phone; }
  public void setPhone(String value) { phone = value; }
  public String getNote() { return note; }
  public void setNote(String value) { note = value; }
  public BigDecimal getShippingFee() { return shippingFee; }
  public void setShippingFee(BigDecimal value) { shippingFee = value; }
  public BigDecimal getTotalAmount() { return totalAmount; }
  public void setTotalAmount(BigDecimal value) { totalAmount = value; }
  public String getStatus() { return status; }
  public void setStatus(String value) { status = value; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public List<OrderItem> getItems() { return items; }
}
