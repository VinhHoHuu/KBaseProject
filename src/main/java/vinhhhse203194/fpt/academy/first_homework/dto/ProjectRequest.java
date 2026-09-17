package vinhhhse203194.fpt.academy.first_homework.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank(message = "Tên dự án không được để trống")
    private String name;
    
    private String description;
}
