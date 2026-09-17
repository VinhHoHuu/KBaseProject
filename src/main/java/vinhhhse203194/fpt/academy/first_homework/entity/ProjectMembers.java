package vinhhhse203194.fpt.academy.first_homework.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "project_members")
public class ProjectMembers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String role;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
}
