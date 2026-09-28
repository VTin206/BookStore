package com.bookstore.voucher.controller;
import com.bookstore.voucher.dto.VoucherRequest; import com.bookstore.voucher.entity.Voucher; import com.bookstore.voucher.service.VoucherService; import jakarta.validation.Valid; import java.math.BigDecimal; import java.util.List; import org.springframework.http.HttpStatus; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/vouchers") public class VoucherController {
 private final VoucherService voucherService; public VoucherController(VoucherService voucherService){this.voucherService=voucherService;}
 @GetMapping("/validate") public BigDecimal validate(@RequestParam String code,@RequestParam BigDecimal subtotal){return voucherService.preview(code,subtotal);}
 @PreAuthorize("hasRole('ADMIN')") @GetMapping public List<Voucher> all(){return voucherService.all();}
 @PreAuthorize("hasRole('ADMIN')") @PostMapping public Voucher create(@Valid @RequestBody VoucherRequest request){return voucherService.create(request);}
 @PreAuthorize("hasRole('ADMIN')") @PutMapping("/{id}") public Voucher update(@PathVariable Long id,@Valid @RequestBody VoucherRequest request){return voucherService.update(id,request);}
 @PreAuthorize("hasRole('ADMIN')") @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){voucherService.delete(id);}
}