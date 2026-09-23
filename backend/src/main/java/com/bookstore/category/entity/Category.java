package com.bookstore.category.entity;
import jakarta.persistence.*;
@Entity @Table(name="categories") public class Category { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,unique=true) private String name; public Category(){} public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} }
