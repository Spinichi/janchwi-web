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
        String template = """
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>잔취 이메일 인증</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; -webkit-text-size-adjust:100%%; -ms-text-size-adjust:100%%;">
  <!-- Preheader (메일 목록 미리보기 문구) -->
  <div style="display:none; font-size:1px; color:#f4f4f4; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    잔취 회원가입 이메일 인증 코드입니다. 15분간 유효합니다.
  </div>

  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; margin:0; padding:0; width:100%%;">
    <tr>
      <td align="center" style="padding:24px 12px;">

        <!-- Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:600px; max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#111111; padding:36px 24px;">
              <img src="https://i.ibb.co/PGT9CQG1/janchwi-logo-NB-1.png"
                   width="192" height="160" alt="Janchwi"
                   style="display:block; width:192px; height:160px; border:0; outline:none; text-decoration:none; margin:0 auto 14px auto;">
              <div style="font-family:Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; font-size:22px; font-weight:700; letter-spacing:0.5px; color:#ffffff; margin:0;">
                잔취
              </div>
              <div style="font-family:Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; font-size:14px; color:#d6d6d6; margin-top:8px; line-height:1.5;">
                이메일 인증
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:34px 28px 12px 28px;">
              <div style="font-family:Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; color:#111111;">
                <div style="font-size:16px; line-height:1.7; margin:0 0 10px 0;">
                  안녕하세요!
                </div>
                <div style="font-size:16px; line-height:1.7; margin:0 0 22px 0; color:#222222;">
                  잔취 회원가입을 위한 인증 코드입니다.
                </div>

                <!-- Code Box -->
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0"
                       style="width:100%%; background-color:#fafafa; border:1px solid #e9e9e9; border-radius:14px;">
                  <tr>
                    <td style="padding:20px 18px;">
                      <div style="font-family:Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; font-size:13px; color:#666666; font-weight:700; letter-spacing:0.3px; margin:0 0 10px 0;">
                        인증 코드
                      </div>

                      <!-- 코드: 모노스페이스 + 안정적인 자간 -->
                      <div style="font-family:ui-monospace, Menlo, Consolas, 'Courier New', monospace; font-size:36px; font-weight:800; color:#EA914E; letter-spacing:6px; line-height:1.2; margin:0;">
                        %s
                      </div>

                      <div style="font-family:Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; font-size:13px; color:#777777; line-height:1.6; margin-top:12px;">
                        위 6자리 코드를 입력하여 이메일 인증을 완료해주세요.
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Info -->
                <div style="font-size:13px; line-height:1.7; color:#666666; margin-top:18px;">
                  인증 코드는 <strong style="color:#111111;">15분간</strong> 유효하며,
                  <strong style="color:#111111;">최대 5회</strong> 시도 가능합니다.
                </div>

                <!-- Warning -->
                <div style="font-size:13px; line-height:1.7; color:#b42318; margin-top:18px;">
                  ⚠️ 본인이 요청하지 않은 경우, 이 메일을 무시해주세요.
                </div>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 28px;">
              <div style="height:1px; background-color:#efefef; line-height:1px; font-size:1px;">&nbsp;</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px 26px 28px;">
              <div style="font-family:Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; font-size:12px; line-height:1.7; color:#888888;">
                <div style="margin:0;">본 메일은 발신 전용입니다.</div>
                <div style="margin:8px 0 0 0;">© 2026 잔취 (Janchwi). All rights reserved.</div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Outer spacing -->
        <div style="height:18px; line-height:18px; font-size:18px;">&nbsp;</div>

      </td>
    </tr>
  </table>
</body>
</html>
""";

        return String.format(template, verificationCode);
    }
}
