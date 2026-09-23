package vinhhhse203194.fpt.academy.first_homework.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long id;
    private String role;       // "user" hoặc "assistant"
    private String content;    // Nội dung tin nhắn
    private String referencedDocs; // JSON list tên documents được trích dẫn
    private LocalDateTime createdAt;
}
