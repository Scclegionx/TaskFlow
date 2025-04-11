package mobile_be.mobile_be.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String to, String token) {
        String resetUrl = "http://localhost:8080/api/auth/reset-password?token=" + token;
        String subject = "Yêu cầu đặt lại mật khẩu";
        String message = "<html><body style='text-align: center; font-family: Arial, sans-serif;'>"
                + "<p style='font-size: 16px;'>Nhấn vào nút dưới đây để đặt lại mật khẩu của bạn:</p>"
                + "<a href='" + resetUrl + "' "
                + "style='display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;'>"
                + "Đặt lại mật khẩu</a>"
                + "<p style='font-size: 14px; color: #888; margin-top: 20px;'>"
                + "Liên kết này có hiệu lực trong <strong>15 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này."
                + "</p>"
                + "</body></html>";

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(message, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // Xử lý exception
            e.printStackTrace();
        }
    }

    public void sendNewPasswordEmail(String to, String newPassword) {
        String subject = "Mật khẩu mới của bạn";
        String message = "<html><body>"
                + "<p>Mật khẩu mới của bạn là: <strong>" + newPassword + "</strong></p>"
                + "</body></html>";
        // Tương tự gửi email như ở trên
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(message, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // Xử lý exception
            e.printStackTrace();
        }
    }
}
