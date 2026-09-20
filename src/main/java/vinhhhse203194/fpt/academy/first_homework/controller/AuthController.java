package vinhhhse203194.fpt.academy.first_homework.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vinhhhse203194.fpt.academy.first_homework.dto.LoginRequest;
import vinhhhse203194.fpt.academy.first_homework.dto.RegisterRequest;
import vinhhhse203194.fpt.academy.first_homework.service.AuthService;

@Tag(name = "Authentication", description = "Các API Đăng nhập và Đăng ký")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "Đăng ký tài khoản", description = "Đăng ký tài khoản mới. Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số.")
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            String result = authService.register(request);
            return ResponseEntity.ok(java.util.Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @Operation(summary = "Đăng nhập", description = "Đăng nhập bằng Email và Password. Trả về Token (JWT) để sử dụng cho các API khác.")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            java.util.Map<String, Object> result = authService.login(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
