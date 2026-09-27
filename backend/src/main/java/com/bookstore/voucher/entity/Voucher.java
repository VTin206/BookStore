package com.bookstore.voucher.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
public class Voucher {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable=false, unique=true, length=50) private String code;
  @Column(name="discount_type", nullable=false, length=20) private String discountType;
  @Column(name="discount_value", nullable=false) private BigDecimal discountValue;
  @Column(name="min_order_amount", nullable=false) private BigDecimal minOrderAmount = BigDecimal.ZERO;
  @Column(name="expires_at") private LocalDateTime expiresAt;
  @Column(name="usage_limit") private Integer usageLimit;
  @Column(name="used_count", nullable=false) private Integer usedCount = 0;
  @Column(nullable=false) private Boolean active = true;
  @Column(name="created_at", nullable=false) private LocalDateTime createdAt = LocalDateTime.now();
  @Column(name="updated_at", nullable=false) private LocalDateTime updatedAt = LocalDateTime.now();
  public Long getId(){return id;} public String getCode(){return code;} public void setCode(String v){code=v;}
  public String getDiscountType(){return discountType;} public void setDiscountType(String v){discountType=v;}
  public BigDecimal getDiscountValue(){return discountValue;} public void setDiscountValue(BigDecimal v){discountValue=v;}
  public BigDecimal getMinOrderAmount(){return minOrderAmount;} public void setMinOrderAmount(BigDecimal v){minOrderAmount=v;}
  public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime v){expiresAt=v;}
  public Integer getUsageLimit(){return usageLimit;} public void setUsageLimit(Integer v){usageLimit=v;}
  public Integer getUsedCount(){return usedCount;} public void setUsedCount(Integer v){usedCount=v;}
  public Boolean getActive(){return active;} public void setActive(Boolean v){active=v;}
  public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
  public void touch(){updatedAt=LocalDateTime.now();}
}