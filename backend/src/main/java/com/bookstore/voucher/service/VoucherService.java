package com.bookstore.voucher.service;

import com.bookstore.voucher.dto.VoucherRequest;
import com.bookstore.voucher.entity.Voucher;
import com.bookstore.voucher.repository.VoucherRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoucherService {
  private static final BigDecimal MAX_PERCENTAGE_DISCOUNT = BigDecimal.valueOf(100);
  private static final String PERCENTAGE_DISCOUNT = "PERCENTAGE";
  private static final String FIXED_DISCOUNT = "FIXED";

  private final VoucherRepository voucherRepository;

  public VoucherService(VoucherRepository voucherRepository) {
    this.voucherRepository = voucherRepository;
  }

  public List<Voucher> findAll() {
    return voucherRepository.findAll();
  }

  public Voucher create(VoucherRequest request) {
    String normalizedCode = normalizeCode(request.code());
    if (voucherRepository.findByCodeIgnoreCase(normalizedCode).isPresent()) {
      throw new IllegalArgumentException("Mã voucher đã tồn tại");
    }

    return saveVoucher(new Voucher(), request);
  }

  public Voucher update(Long id, VoucherRequest request) {
    Voucher voucher = voucherRepository.findById(id).orElseThrow();
    return saveVoucher(voucher, request);
  }

  public void delete(Long id) {
    voucherRepository.deleteById(id);
  }

  public BigDecimal preview(String code, BigDecimal subtotal) {
    if (code == null || code.isBlank()) {
      return BigDecimal.ZERO;
    }

    Voucher voucher = findActiveVoucher(code);
    validateVoucher(voucher, subtotal);
    return calculateDiscount(voucher, subtotal);
  }

  @Transactional
  public BigDecimal apply(String code, BigDecimal subtotal) {
    if (code == null || code.isBlank()) {
      return BigDecimal.ZERO;
    }

    Voucher voucher = voucherRepository.findByCodeForUpdate(normalizeCode(code))
        .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));
    validateVoucher(voucher, subtotal);

    voucher.setUsedCount(voucher.getUsedCount() + 1);
    voucherRepository.save(voucher);
    return calculateDiscount(voucher, subtotal);
  }

  private Voucher saveVoucher(Voucher voucher, VoucherRequest request) {
    String discountType = request.discountType().trim().toUpperCase();
    validateDiscountType(discountType);

    if (PERCENTAGE_DISCOUNT.equals(discountType)
        && request.discountValue().compareTo(MAX_PERCENTAGE_DISCOUNT) > 0) {
      throw new IllegalArgumentException("Phần trăm giảm tối đa là 100");
    }

    voucher.setCode(normalizeCode(request.code()));
    voucher.setDiscountType(discountType);
    voucher.setDiscountValue(request.discountValue());
    voucher.setMinOrderAmount(request.minOrderAmount());
    voucher.setExpiresAt(request.expiresAt());
    voucher.setUsageLimit(request.usageLimit());
    if (request.active() != null) {
      voucher.setActive(request.active());
    }
    voucher.touch();
    return voucherRepository.save(voucher);
  }

  private Voucher findActiveVoucher(String code) {
    return voucherRepository.findByCodeIgnoreCase(normalizeCode(code))
        .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));
  }

  private void validateDiscountType(String discountType) {
    if (!PERCENTAGE_DISCOUNT.equals(discountType) && !FIXED_DISCOUNT.equals(discountType)) {
      throw new IllegalArgumentException("Loại giảm giá không hợp lệ");
    }
  }

  private void validateVoucher(Voucher voucher, BigDecimal subtotal) {
    boolean expired = voucher.getExpiresAt() != null
        && voucher.getExpiresAt().isBefore(LocalDateTime.now());
    boolean usageLimitReached = voucher.getUsageLimit() != null
        && voucher.getUsedCount() >= voucher.getUsageLimit();
    boolean belowMinimumOrder = subtotal.compareTo(voucher.getMinOrderAmount()) < 0;

    if (!Boolean.TRUE.equals(voucher.getActive()) || expired || usageLimitReached || belowMinimumOrder) {
      throw new IllegalArgumentException(
          "Mã giảm giá không hợp lệ, chưa đủ điều kiện hoặc đã hết hạn");
    }
  }

  private BigDecimal calculateDiscount(Voucher voucher, BigDecimal subtotal) {
    BigDecimal discountAmount = PERCENTAGE_DISCOUNT.equals(voucher.getDiscountType())
        ? subtotal.multiply(voucher.getDiscountValue())
            .divide(MAX_PERCENTAGE_DISCOUNT, 2, RoundingMode.HALF_UP)
        : voucher.getDiscountValue();

    return discountAmount.min(subtotal).setScale(0, RoundingMode.HALF_UP);
  }

  private String normalizeCode(String code) {
    return code.trim().toUpperCase();
  }
}