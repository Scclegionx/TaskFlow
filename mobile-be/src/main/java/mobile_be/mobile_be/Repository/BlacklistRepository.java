package mobile_be.mobile_be.Repository;

import mobile_be.mobile_be.Model.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlacklistRepository extends JpaRepository<BlacklistedToken, Integer> {
    Optional<BlacklistedToken> findByToken(String token);
}
