package vinhhhse203194.fpt.academy.first_homework.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;
import vinhhhse203194.fpt.academy.first_homework.entity.ProjectStatus;

@Data
public class ProjectRequest {
    @NotBlank(message = "Tên dự án không được để trống")
    private String name;
    
    private String description;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private ProjectStatus status;

}
