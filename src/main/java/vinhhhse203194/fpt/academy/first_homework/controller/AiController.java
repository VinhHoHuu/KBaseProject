package vinhhhse203194.fpt.academy.first_homework.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import vinhhhse203194.fpt.academy.first_homework.dto.ChatRequest;
import vinhhhse203194.fpt.academy.first_homework.dto.ChatResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.User;
import vinhhhse203194.fpt.academy.first_homework.security.CustomUserDetails;
import vinhhhse203194.fpt.academy.first_homework.service.AiService;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/ai")
@Tag(name = "AI Chatbot", description = "API cho AI Chatbot - Hỏi đáp dựa trên tài liệu dự án")
public class AiController {

    @Autowired
    private AiService aiService;

    /**
     * Gửi câu hỏi cho AI chatbot. Response được stream qua SSE.
     * Events: "message" (chunk text), "done" (hoàn thành + referenced docs), "error" (lỗi)
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Chat với AI", description = "Hỏi chatbot về nội dung tài liệu. Response streaming qua SSE.")
    public SseEmitter chat(
            @PathVariable Long projectId,
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User currentUser = userDetails.getUser();
        return aiService.chat(projectId, currentUser, request.getQuestion());
    }

    /**
     * Lấy lịch sử chat trong project.
     */
    @GetMapping("/history")
    @Operation(summary = "Lấy lịch sử chat", description = "Xem toàn bộ lịch sử chat của bạn trong dự án.")
    public ResponseEntity<?> getChatHistory(
            @PathVariable Long projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            User currentUser = userDetails.getUser();
            List<ChatResponse> history = aiService.getChatHistory(projectId, currentUser);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Xóa lịch sử chat.
     */
    @DeleteMapping("/history")
    @Operation(summary = "Xóa lịch sử chat", description = "Xóa toàn bộ lịch sử chat của bạn trong dự án.")
    public ResponseEntity<?> clearChatHistory(
            @PathVariable Long projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            User currentUser = userDetails.getUser();
            aiService.clearChatHistory(projectId, currentUser);
            return ResponseEntity.ok("Đã xóa lịch sử chat!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
