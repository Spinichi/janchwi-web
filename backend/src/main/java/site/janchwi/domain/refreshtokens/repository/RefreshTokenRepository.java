package site.janchwi.domain.refreshtokens.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import site.janchwi.domain.refreshtokens.entity.RefreshToken;
import site.janchwi.domain.users.entity.User;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByUser(User user);
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteByUser(User user);
    long deleteByExpiresAtBefore(Instant expiryDate);
}
