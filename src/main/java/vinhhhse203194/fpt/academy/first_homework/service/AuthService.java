package vinhhhse203194.fpt.academy.first_homework.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vinhhhse203194.fpt.academy.first_homework.dto.LoginRequest;
import vinhhhse203194.fpt.academy.first_homework.dto.RegisterRequest;
import vinhhhse203194.fpt.academy.first_homework.entity.User;
import vinhhhse203194.fpt.academy.first_homework.repository.IUserRepository;
import vinhhhse203194.fpt.academy.first_homework.security.JwtUtils;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    
    //Register
    public String register(RegisterRequest request) {
        //kiểm tra xem email đã tồn tại hay chưa
        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        //Tạo entity user mới để lưu trữ xuống database
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setFullName(request.getFullName());
        userRepository.save(user);
        return "Đăng ký thành công";
    }

    //Login
    public java.util.Map<String, Object> login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.
            authenticate(new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword()));
            
            String token = jwtUtils.generateTokenFromEmail(request.getEmail());
            User user = userRepository.findByEmail(request.getEmail()).get();
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            
            return response;
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new RuntimeException("Sai email hoặc mật khẩu. Vui lòng kiểm tra lại!");
        }
    }
}
