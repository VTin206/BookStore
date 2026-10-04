package com.bookstore.book.repository;

import com.bookstore.book.entity.Book;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {
  List<Book> findAllByActiveTrue();
  List<Book> findAllByActiveTrueOrderByPublicationDateDescCreatedAtDesc();
  @Query(value = "select exists(select 1 from order_items where book_id = :bookId)", nativeQuery = true)
  boolean hasOrderItems(@Param("bookId") Long bookId);

  @Query(value = "select exists(select 1 from cart_items where book_id = :bookId)", nativeQuery = true)
  boolean hasCartItems(@Param("bookId") Long bookId);

  @Query(value = "select exists(select 1 from reviews where book_id = :bookId)", nativeQuery = true)
  boolean hasReviews(@Param("bookId") Long bookId);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query("select b from Book b where b.id = :id")
  java.util.Optional<Book> findByIdForUpdate(@Param("id") Long id);

  @Query("""
      select distinct b from Book b
      left join b.authorRef a
      left join b.category c
      where lower(b.title) like lower(concat('%', :search, '%'))
         or lower(b.author) like lower(concat('%', :search, '%'))
         or lower(a.name) like lower(concat('%', :search, '%'))
         or lower(c.name) like lower(concat('%', :search, '%'))
      """)
  List<Book> search(@Param("search") String search);

  @Query("select distinct b from Book b left join b.authorRef a left join b.categories c where b.active = true and (lower(b.title) like lower(concat('%', :search, '%')) or lower(b.author) like lower(concat('%', :search, '%')) or lower(a.name) like lower(concat('%', :search, '%')) or lower(c.name) like lower(concat('%', :search, '%')))")
  List<Book> searchActive(@Param("search") String search);

  List<Book> findAllByOrderByPublicationDateDescCreatedAtDesc();

  @Query("""
      select b from Book b
      left join OrderItem oi on oi.book = b
      group by b
      order by coalesce(sum(case when oi.order.status <> 'CANCELLED' then oi.quantity else 0 end), 0) desc,
               b.title asc
      """)
  List<Book> findBestSellers();

  @Query("select b from Book b left join OrderItem oi on oi.book = b where b.active = true group by b order by coalesce(sum(case when oi.order.status <> 'CANCELLED' then oi.quantity else 0 end), 0) desc, b.title asc")
  List<Book> findActiveBestSellers();

  @Query("select count(distinct b) > 0 from Book b left join b.categories c where b.category.id = :categoryId or c.id = :categoryId")
  boolean existsByCategoryId(@Param("categoryId") Long categoryId);

  @Query("select count(b) > 0 from Book b where b.authorRef.id = :authorId")
  boolean existsByAuthorId(@Param("authorId") Long authorId);

  @Query("select count(b) > 0 from Book b where b.publisher.id = :publisherId")
  boolean existsByPublisherId(@Param("publisherId") Long publisherId);
}
