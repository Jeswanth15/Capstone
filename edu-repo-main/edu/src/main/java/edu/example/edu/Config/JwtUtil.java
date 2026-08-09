// package edu.example.edu.Config;

// import java.util.Date;
// import java.util.HashMap;
// import java.util.Map;

// import org.springframework.stereotype.Component;

// import io.jsonwebtoken.Claims;
// import io.jsonwebtoken.Jwts;
// import io.jsonwebtoken.SignatureAlgorithm;

// @Component
// public class JwtUtil {

//     private final String SECRET_KEY = "mySecretKey123456";
//     private final long TOKEN_VALIDITY = 24 * 60 * 60 * 1000;

//     // Generate token with extra info
//     public String generateToken(Long userId, String email, String role, Long schoolId, String name) {
//         Map<String, Object> claims = new HashMap<>();
//         claims.put("userId", userId);
//         claims.put("role", role);
//         claims.put("schoolId", schoolId);
//         claims.put("name", name);

//         return Jwts.builder()
//                 .setClaims(claims)
//                 .setSubject(email)
//                 .setIssuedAt(new Date(System.currentTimeMillis()))
//                 .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
//                 .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
//                 .compact();
//     }

//     // Extract email (subject)
//     public String extractUsername(String token) {
//         return getClaims(token).getSubject();
//     }

//     // Extract userId
//     public Long extractUserId(String token) {
//         return Long.valueOf(String.valueOf(getClaims(token).get("userId")));
//     }

//     // ✅ Public method to extract role
//     public String extractRole(String token) {
//         return (String) getClaims(token).get("role");
//     }

//     // Validate token
//     public boolean validateToken(String token, String email) {
//         final String username = extractUsername(token);
//         return (username.equals(email) && !isTokenExpired(token));
//     }

//     private boolean isTokenExpired(String token) {
//         return getClaims(token).getExpiration().before(new Date());
//     }

//     // Private claims getter
//     private Claims getClaims(String token) {
//         return Jwts.parser()
//                 .setSigningKey(SECRET_KEY)
//                 .parseClaimsJws(token)
//                 .getBody();
//     }
// }
package edu.example.edu.Config;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtUtil {

    @Value("${jwt.secret:defaultSecretKey123456}")
    private String SECRET_KEY;
    private final long TOKEN_VALIDITY = 24 * 60 * 60 * 1000;

    // Generate token with extra info
    // UPDATED: accepts classroomId and stores it in claims
    public String generateToken(Long userId, String email, String role, Long schoolId, Long classroomId, String name) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("schoolId", schoolId);
        claims.put("classroomId", classroomId); // NEW claim
        claims.put("name", name);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // Extract email (subject)
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Extract userId
    public Long extractUserId(String token) {
        Object v = getClaims(token).get("userId");
        return v == null ? null : Long.valueOf(String.valueOf(v));
    }

    // ✅ Public method to extract role
    public String extractRole(String token) {
        return (String) getClaims(token).get("role");
    }

    // ✅ New: extract classroomId
    public Long extractClassroomId(String token) {
        Object v = getClaims(token).get("classroomId");
        return v == null ? null : Long.valueOf(String.valueOf(v));
    }

    // ✅ New: extract schoolId helper
    public Long extractSchoolId(String token) {
        Object v = getClaims(token).get("schoolId");
        return v == null ? null : Long.valueOf(String.valueOf(v));
    }

    // Validate token
    public boolean validateToken(String token, String email) {
        final String username = extractUsername(token);
        return (username.equals(email) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    // Private claims getter
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }
}
