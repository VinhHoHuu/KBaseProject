package vinhhhse203194.fpt.academy.first_homework.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${kbase.app.jwtSecret}")
    private String jwtSecret;

    @Value("${kbase.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // Lấy key bí mật để ký token
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    // Hàm 1: Tạo token từ email của User
    public String generateTokenFromEmail(String email) {
        return Jwts.builder()
                .setSubject(email) // Lưu email vào token
                .setIssuedAt(new Date()) // Thời gian tạo
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Thời gian hết hạn
                .signWith(key(), SignatureAlgorithm.HS256) // Ký bằng thuật toán HS256
                .compact();
    }

    // Hàm 2: Lấy email từ token
    public String getEmailFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // Hàm 3: Kiểm tra xem token có hợp lệ không (có bị sửa đổi, hết hạn không)
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }
}
