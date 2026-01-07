package site.janchwi.global.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private boolean success;
    private String message;
    private int status;
    private String code; // 에러 코드 (예: EMAIL_NOT_VERIFIED, ACCOUNT_LOCKED)
    private Instant timestamp;
    private List<FieldError> errors;

    public ErrorResponse(String message, int status) {
        this.success = false;
        this.message = message;
        this.status = status;
        this.code = null;
        this.timestamp = Instant.now();
        this.errors = null;
    }

    public ErrorResponse(String message, int status, String code) {
        this.success = false;
        this.message = message;
        this.status = status;
        this.code = code;
        this.timestamp = Instant.now();
        this.errors = null;
    }

    public ErrorResponse(String message, int status, List<FieldError> errors) {
        this.success = false;
        this.message = message;
        this.status = status;
        this.code = null;
        this.timestamp = Instant.now();
        this.errors = errors;
    }

    @Getter
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
    }
}
