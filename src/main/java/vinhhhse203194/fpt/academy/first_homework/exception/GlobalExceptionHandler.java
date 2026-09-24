package vinhhhse203194.fpt.academy.first_homework.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Bắt tất cả các lỗi chưa được handle
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        // In toàn bộ lỗi ra console (Log của Render/Server) để mình có thể debug chi tiết
        ex.printStackTrace();
        
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getClass().getSimpleName());
        response.put("message", ex.getMessage() != null ? ex.getMessage() : "Unknown error occurred");
        
        // Trả về JSON để Frontend đọc được err.response.data.message
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // Bắt riêng lỗi vượt quá dung lượng file
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        exc.printStackTrace();
        
        Map<String, String> response = new HashMap<>();
        response.put("error", "Payload Too Large");
        response.put("message", "File upload quá dung lượng cho phép! Vui lòng chọn file dưới 100MB.");
        
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }
}
