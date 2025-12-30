package site.janchwi.domain.refreshtokens.entity;

import jakarta.persistence.*;
import lombok.*;
import site.janchwi.domain.users.entity.User;
import site.janchwi.global.common.BaseEntity;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RefreshToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 255)
    private String tokenHash; // SHA-256 해시값

    @Column(nullable = false)
    private Instant expiresAt;

    public void updateTokenHash(String tokenHash, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }
}
