package vinhhhse203194.fpt.academy.first_homework.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên gốc của file khi người dùng tải lên (vd: tailieu.pdf)
    @Column(nullable = false)
    private String name;

    // Loại file (vd: application/pdf, image/png)
    @Column(nullable = false)
    private String type;

    // Kích thước file (bytes)
    @Column(nullable = false)
    private Long size;

    // Tên file đã mã hóa lưu trên MinIO (để tránh trùng lặp, vd: uuid-tailieu.pdf)
    @Column(nullable = false, unique = true)
    private String fileKey;

    // Project chứa file này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Người tải file lên
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}
