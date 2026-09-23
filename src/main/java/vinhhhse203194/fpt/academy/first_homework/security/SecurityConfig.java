package vinhhhse203194.fpt.academy.first_homework.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    // Quy định dùng bộ mã hoá BCrypt cho mật khẩu (Băm mật khẩu ra thành chuỗi lằng nhằng để chống hack)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Kết nối phòng Nhân sự và cách kiểm tra mật khẩu
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Người quản lý việc xác thực
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // BỘ LUẬT CHÍNH (Filter Chain)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(org.springframework.security.config.Customizer.withDefaults())
            .csrf(csrf -> csrf.disable()) // Tắt CSRF vì chúng ta làm API (không làm form HTML truyền thống)
            .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint)) // Tuỳ biến lỗi 401
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không lưu phiên đăng nhập (Stateless)
            .authorizeHttpRequests(auth -> 
                auth.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.FORWARD, jakarta.servlet.DispatcherType.ERROR, jakarta.servlet.DispatcherType.ASYNC).permitAll()
                    .requestMatchers("/", "/api/auth/**", "/error").permitAll() // LUẬT 1: Đường này (/api/auth) là để Đăng nhập/Đăng ký nên THẢ CỬA. "/error" để hiển thị lỗi gốc.
                    .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // LUẬT 3: Cho phép tất cả các request OPTIONS (CORS preflight) đi qua
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll() // Mở cửa cho Swagger
                    .anyRequest().authenticated() // LUẬT 2: Toàn bộ các đường khác bắt buộc phải TRÌNH THẺ
            );

        http.authenticationProvider(authenticationProvider());
        
        // Cắm cái Trạm kiểm soát JwtFilter của chúng ta lên phía trước
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
