package site.janchwi.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class TokenPairDto {
    private Long userId;
    private String accessToken;
    private String refreshToken;
}
