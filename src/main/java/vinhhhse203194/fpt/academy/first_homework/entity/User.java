package vinhhhse203194.fpt.academy.first_homework.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Email must be unique and not null
    @Column(unique = true, nullable = false)
    private String email;

    // Password must not be null
    @Column(nullable = false)
    private String password;

    // Full name can be null
    private String fullName;

    // Role must not be null
    @Column(nullable = false)
    private String role;
}
