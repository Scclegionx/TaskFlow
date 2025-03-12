package mobile_be.mobile_be.Utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Set;
import java.util.function.Function;

@Component
public class JwtUtil {
    private final String SECRET_KEY = "1cbaee3794baa86215098188f54d3adaaefc3c7b49ed28dc475cc29a4ac4fe05";

    public String generateToken(int id, String email, Set<String> roles, String name) {
        return Jwts.builder()
                .setSubject(email)
                .claim("id", id)
                .claim("roles", roles)
                .claim("username", name)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public int extractId(String token) {
        return extractClaim(token, claims -> claims.get("id", Integer.class));
    }

    public Set<String> extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", Set.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }

    public boolean validateToken(String token, String email) {
        return email.equals(extractEmail(token));
    }
}
