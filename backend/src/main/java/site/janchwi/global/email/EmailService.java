package site.janchwi.global.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import site.janchwi.global.exception.EmailSendException;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * 이메일 인증 코드 발송
     */
    public void sendVerificationEmail(String toEmail, String verificationCode) {
        String subject = "[잔취] 이메일 인증 코드";
        String htmlContent = buildVerificationEmailHtml(verificationCode);

        sendEmail(toEmail, subject, htmlContent);
    }

    /**
     * 이메일 발송 (SMTP)
     */
    private void sendEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "잔취 (Janchwi)");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);

            log.info("이메일 발송 성공: {}", toEmail);
        } catch (MessagingException e) {
            log.error("이메일 발송 실패: {} - {}", toEmail, e.getMessage(), e);
            throw new EmailSendException("이메일 발송에 실패했습니다.", e);
        } catch (Exception e) {
            log.error("이메일 발송 중 예외 발생: {} - {}", toEmail, e.getMessage(), e);
            throw new EmailSendException("이메일 발송에 실패했습니다.", e);
        }
    }

    /**
     * 이메일 인증 HTML 템플릿
     */
    private String buildVerificationEmailHtml(String verificationCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Noto Sans KR', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #EA914E 0%, #D4793A 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                        .content { padding: 40px 30px; text-align: center; }
                        .code-box { background-color: #f8f9fa; border: 2px dashed #EA914E; border-radius: 8px; padding: 30px; margin: 30px 0; }
                        .code { font-size: 36px; font-weight: 700; color: #EA914E; letter-spacing: 8px; margin: 10px 0; }
                        .description { color: #6c757d; font-size: 14px; line-height: 1.6; margin: 20px 0; }
                        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍷 잔취</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px;">이메일 인증</p>
                        </div>
                        <div class="content">
                            <p style="font-size: 16px; color: #333;">안녕하세요!</p>
                            <p style="font-size: 16px; color: #333;">잔취 회원가입을 위한 인증 코드입니다.</p>

                            <div class="code-box">
                                <p style="margin: 0; color: #6c757d; font-size: 14px;">인증 코드</p>
                                <div class="code">%s</div>
                            </div>

                            <p class="description">
                                위 6자리 코드를 입력하여 이메일 인증을 완료해주세요.<br>
                                인증 코드는 <strong>15분간</strong> 유효하며, <strong>최대 5회</strong> 시도 가능합니다.
                            </p>

                            <p class="description" style="color: #dc3545;">
                                ⚠️ 본인이 요청하지 않은 경우, 이 메일을 무시해주세요.
                            </p>
                        </div>
                        <div class="footer">
                            <p>본 메일은 발신 전용입니다.</p>
                            <p>© 2024 잔취 (Janchwi). All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(verificationCode);
    }
}
