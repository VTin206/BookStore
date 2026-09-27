package com.bookstore.voucher.controller;
import com.bookstore.voucher.dto.VoucherRequest; import com.bookstore.voucher.entity.Voucher; import com.bookstore.voucher.service.VoucherService; import jakarta.validation.Valid; import java.math.BigDecimal; import java.util.List; import org.springframework.http.HttpStatus; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/vouchers") public class VoucherController {
 private final VoucherService service; public VoucherController(VoucherService s){service=s;}
 @GetMapping("/validate") public BigDecimal validate(@RequestParam String code,@RequestParam BigDecimal subtotal){return service.preview(code,subtotal);}
 @PreAuthorize("hasRole('ADMIN')") @GetMapping public List<Voucher> all(){return service.all();}
 @PreAuthorize("hasRole('ADMIN')") @PostMapping public Voucher create(@Valid @RequestBody VoucherRequest r){return service.create(r);}
 @PreAuthorize("hasRole('ADMIN')") @PutMapping("/{id}") public Voucher update(@PathVariable Long id,@Valid @RequestBody VoucherRequest r){return service.update(id,r);}
 @PreAuthorize("hasRole('ADMIN')") @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete(id);}
}