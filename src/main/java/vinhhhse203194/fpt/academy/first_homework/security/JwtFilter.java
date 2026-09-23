package vinhhhse203194.fpt.academy.first_homework.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Bước 1: Lấy token từ header của request
            String jwt = parseJwt(request);
            System.out.println("[JwtFilter] Method: " + request.getMethod() + ", URI: " + request.getRequestURI());
            System.out.println("[JwtFilter] Authorization header: " + request.getHeader("Authorization"));
            System.out.println("[JwtFilter] Parsed JWT: " + jwt);

            // Bước 2: Nếu có thẻ và máy quét báo thẻ xịn (hợp lệ)
            if (jwt != null) {
                boolean isValid = jwtUtils.validateJwtToken(jwt);
                System.out.println("[JwtFilter] JWT isValid: " + isValid);
                
                if (isValid) {
                    // Đọc email in trên thẻ
                    String email = jwtUtils.getEmailFromJwtToken(jwt);
    
                    // Nhờ phòng nhân sự lấy hồ sơ lên
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
    
                    // Duyệt cho qua: Cấp quyền truy cập cho user này
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    
                    // Báo cho hệ thống biết "Người này hợp pháp!"
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("[JwtFilter] Authentication set successfully for: " + email);
                } else {
                    System.out.println("[JwtFilter] Invalid JWT token");
                }
            } else {
                System.out.println("[JwtFilter] No JWT token found in request");
            }
        } catch (Exception e) {
            System.err.println("Không thể thiết lập xác thực người dùng: " + e.getMessage());
        }

        // Bước 3: Cho phép request đi tiếp qua cổng (để vào tới Controller)
        filterChain.doFilter(request, response);
    }

    // Hàm phụ: Tìm cái thẻ trong túi (Header). Chuẩn quốc tế quy định thẻ JWT phải bắt đầu bằng chữ "Bearer "
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Bỏ 7 ký tự chữ "Bearer " đi để lấy mỗi đoạn mã token
        }
        return null;
    }
}
