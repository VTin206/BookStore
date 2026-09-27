package com.bookstore.book.repository;

import com.bookstore.book.entity.Book;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRepository extends JpaRepository<Book, Long> {
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

  List<Book> findAllByOrderByPublicationDateDescCreatedAtDesc();

  @Query("""
      select b from Book b
      left join OrderItem oi on oi.book = b
      group by b
      order by coalesce(sum(case when oi.order.status <> 'CANCELLED' then oi.quantity else 0 end), 0) desc,
               b.title asc
      """)
  List<Book> findBestSellers();

  @Query("select count(b) > 0 from Book b where b.category.id = :categoryId")
  boolean existsByCategoryId(@Param("categoryId") Long categoryId);

  @Query("select count(b) > 0 from Book b where b.authorRef.id = :authorId")
  boolean existsByAuthorId(@Param("authorId") Long authorId);

  @Query("select count(b) > 0 from Book b where b.publisher.id = :publisherId")
  boolean existsByPublisherId(@Param("publisherId") Long publisherId);
}
