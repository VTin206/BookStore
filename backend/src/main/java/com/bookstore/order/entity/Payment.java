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

  public void setOrder(Order v) {
    order = v;
  }

  public void setAmount(BigDecimal v) {
    amount = v;
  }

  public void setMethod(String v) {
    method = v;
  }

  public void setStatus(String v) {
    status = v;
  }

  public void setPaid(boolean v) {
    paid = v;
  }
}
