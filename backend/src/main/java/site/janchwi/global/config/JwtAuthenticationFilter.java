package site.janchwi.global.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final List<String> WHITELIST = List.of(
            "/v1/auth/login",
            "/v1/auth/signup",
            "/v1/auth/check-email",
            "/v1/auth/send-verification",
            "/v1/auth/verify-email",
            "/v1/auth/refresh",
            "/actuator/health",
            "/actuator/info",
            "/swagger-ui",
            "/v3/api-docs",
            "/swagger-resources"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();

        // WHITELIST에 포함된 경로는 토큰 검증 생략
        if (WHITELIST.stream().anyMatch(path::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authorization 헤더에서 토큰 추출
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // "Bearer " 제거

        // 토큰 검증
        if (!jwtTokenProvider.validate(token)) {
            log.warn("JWT 토큰 검증 실패: path={}", path);
            filterChain.doFilter(request, response);
            return;
        }

        // 토큰에서 userId 추출 및 SecurityContext에 저장
        Long userId = jwtTokenProvider.getUserId(token);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        String.valueOf(userId),
                        null,
                        List.of(new SimpleGrantedAuthority("USER"))
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.debug("JWT 인증 성공: userId={}, path={}", userId, path);

        filterChain.doFilter(request, response);
    }
}
