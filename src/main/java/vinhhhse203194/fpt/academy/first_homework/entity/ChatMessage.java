package vinhhhse203194.fpt.academy.first_homework.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thuộc project nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Ai hỏi (user)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // "user" hoặc "assistant"
    @Column(nullable = false, length = 20)
    private String role;

    // Nội dung tin nhắn
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // JSON list document names được trích dẫn trong câu trả lời
    @Column(columnDefinition = "TEXT")
    private String referencedDocs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
