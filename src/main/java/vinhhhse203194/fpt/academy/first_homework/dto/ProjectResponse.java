package vinhhhse203194.fpt.academy.first_homework.dto;

import lombok.Data;
import java.time.LocalDateTime;
import vinhhhse203194.fpt.academy.first_homework.entity.ProjectStatus;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ProjectStatus status;
    private String myRole;
}
