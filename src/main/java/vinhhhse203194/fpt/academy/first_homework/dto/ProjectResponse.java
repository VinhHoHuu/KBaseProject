package vinhhhse203194.fpt.academy.first_homework.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private String myRole;
}
