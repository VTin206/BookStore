package com.bookstore.voucher.service;
import com.bookstore.voucher.dto.VoucherRequest;
import com.bookstore.voucher.entity.Voucher;
import com.bookstore.voucher.repository.VoucherRepository;
import java.math.*; import java.time.*; import java.util.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class VoucherService {
 private final VoucherRepository repo; public VoucherService(VoucherRepository r){repo=r;}
 public List<Voucher> all(){return repo.findAll();}
 public Voucher create(VoucherRequest r){ if(repo.findByCodeIgnoreCase(r.code().trim()).isPresent()) throw new IllegalArgumentException("Mã voucher đã tồn tại"); return save(new Voucher(),r); }
 public Voucher update(Long id,VoucherRequest r){return save(repo.findById(id).orElseThrow(),r);}
 public void delete(Long id){repo.deleteById(id);}
 private Voucher save(Voucher v,VoucherRequest r){String type=r.discountType().trim().toUpperCase(); if(!type.equals("PERCENTAGE")&&!type.equals("FIXED")) throw new IllegalArgumentException("Loại giảm giá không hợp lệ"); if(type.equals("PERCENTAGE")&&r.discountValue().compareTo(new BigDecimal("100"))>0) throw new IllegalArgumentException("Phần trăm giảm tối đa là 100"); v.setCode(r.code().trim().toUpperCase()); v.setDiscountType(type); v.setDiscountValue(r.discountValue()); v.setMinOrderAmount(r.minOrderAmount()); v.setExpiresAt(r.expiresAt()); v.setUsageLimit(r.usageLimit()); if(r.active()!=null)v.setActive(r.active()); v.touch(); return repo.save(v);}
 public BigDecimal preview(String code, BigDecimal subtotal){ if(code==null||code.isBlank()) return BigDecimal.ZERO; Voucher v=repo.findByCodeIgnoreCase(code.trim().toUpperCase()).orElseThrow(()->new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã hết hạn")); validate(v,subtotal); BigDecimal d=v.getDiscountType().equals("PERCENTAGE")?subtotal.multiply(v.getDiscountValue()).divide(new BigDecimal("100"),2,RoundingMode.HALF_UP):v.getDiscountValue(); return d.min(subtotal).setScale(0,RoundingMode.HALF_UP); }
 @Transactional public BigDecimal apply(String code, BigDecimal subtotal){if(code==null||code.isBlank())return BigDecimal.ZERO; Voucher v=repo.findByCodeForUpdate(code.trim().toUpperCase()).orElseThrow(()->new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã hết hạn")); validate(v,subtotal); v.setUsedCount(v.getUsedCount()+1); repo.save(v); BigDecimal d=v.getDiscountType().equals("PERCENTAGE")?subtotal.multiply(v.getDiscountValue()).divide(new BigDecimal("100"),2,RoundingMode.HALF_UP):v.getDiscountValue(); return d.min(subtotal).setScale(0,RoundingMode.HALF_UP); }
 private void validate(Voucher v,BigDecimal subtotal){if(!Boolean.TRUE.equals(v.getActive())||(v.getExpiresAt()!=null&&v.getExpiresAt().isBefore(LocalDateTime.now()))||(v.getUsageLimit()!=null&&v.getUsedCount()>=v.getUsageLimit())||subtotal.compareTo(v.getMinOrderAmount())<0) throw new IllegalArgumentException("Mã giảm giá không hợp lệ, chưa đủ điều kiện hoặc đã hết hạn");}
}