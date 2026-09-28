package com.bookstore.order.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payments")
public class Payment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "order_id", nullable = false)
  private Order order;

  private BigDecimal amount;
  private String method = "COD";
  private String status = "PENDING";

  @Column(name = "transaction_code")
  private String transactionCode;

  private boolean paid = false;

  public Payment() {}

  public void setOrder(Order order) {
    this.order = order;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public void setMethod(String method) {
    this.method = method;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public void setPaid(boolean paid) {
    this.paid = paid;
  }

  public String getStatus() {
    return status;
  }

  public boolean isPaid() {
    return paid;
  }
}
