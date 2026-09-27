package com.bookstore.voucher.repository;
import com.bookstore.voucher.entity.Voucher;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
public interface VoucherRepository extends JpaRepository<Voucher,Long> {
  Optional<Voucher> findByCodeIgnoreCase(String code);
  @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select v from Voucher v where upper(v.code)=upper(:code)") Optional<Voucher> findByCodeForUpdate(@Param("code") String code);
}