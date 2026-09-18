package vinhhhse203194.fpt.academy.first_homework.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vinhhhse203194.fpt.academy.first_homework.entity.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private String name;
    private String type;
    private Long size;
    private String url; // Nơi chứa Presigned URL của MinIO
    private Long projectId;
    private Long uploadedById;
    private String uploadedByUsername;
    private LocalDateTime uploadedAt;

    // Constructor xịn: Nhét Document Entity và URL vào, nó sẽ tự tách data ra
    public DocumentResponse(Document document, String presignedUrl) {
        this.id = document.getId();
        this.name = document.getName();
        this.type = document.getType();
        this.size = document.getSize();
        this.url = presignedUrl;
        this.projectId = document.getProject().getId();
        this.uploadedById = document.getUploadedBy().getId();
        this.uploadedByUsername = document.getUploadedBy().getEmail(); // User entity dùng email
        this.uploadedAt = document.getUploadedAt();
    }
}
