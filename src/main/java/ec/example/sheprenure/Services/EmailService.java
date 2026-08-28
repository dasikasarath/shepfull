package ec.example.sheprenure.Services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api-key:}")
    private String apiKey;

    @Value("${brevo.sender-email:}")
    private String senderEmail;

    @Value("${brevo.sender-name:SHEPRENURE}")
    private String senderName;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public EmailService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Send a plain text email via Brevo REST API (HTTPS port 443).
     */
    public boolean sendEmail(String toEmail, String subject, String textContent) {
        return sendHtmlEmail(toEmail, subject, "<div style='font-family: sans-serif; font-size: 15px; color: #333; line-height: 1.6;'>" + textContent.replace("\n", "<br/>") + "</div>", textContent);
    }

    /**
     * Send an HTML email with text fallback via Brevo REST API.
     */
    public boolean sendHtmlEmail(String toEmail, String subject, String htmlContent, String textContent) {
        if (toEmail == null || toEmail.isBlank()) {
            System.err.println("[Brevo Email] Target email is blank, skipping send.");
            return false;
        }

        if (apiKey == null || apiKey.isBlank()) {
            System.err.println("[Brevo Email] Brevo API key is not configured! Please set BREVO_API_KEY environment variable.");
            return false;
        }

        String fromEmail = (senderEmail != null && !senderEmail.isBlank()) ? senderEmail.trim() : "sarathdasika@gmail.com";

        try {
            Map<String, Object> payload = new HashMap<>();

            Map<String, String> sender = new HashMap<>();
            sender.put("name", senderName);
            sender.put("email", fromEmail);
            payload.put("sender", sender);

            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", toEmail.trim());
            payload.put("to", Collections.singletonList(recipient));

            payload.put("subject", subject);
            payload.put("htmlContent", htmlContent);
            if (textContent != null && !textContent.isBlank()) {
                payload.put("textContent", textContent);
            }

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", apiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("[Brevo Email] Email sent successfully to " + toEmail + " (Status: " + response.statusCode() + ")");
                return true;
            } else {
                System.err.println("[Brevo Email] Failed to send email to " + toEmail + ". HTTP Status: " + response.statusCode() + " Body: " + response.body());
                return false;
            }
        } catch (Exception e) {
            System.err.println("[Brevo Email] Error while sending email to " + toEmail + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Send formatted branded OTP email for Verification or Password Reset.
     */
    public boolean sendOtpEmail(String toEmail, String otp, String title, String subtitle, int expiryMinutes) {
        String html = "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;'>"
                + "  <table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f6f9;padding:30px 0;'>"
                + "    <tr>"
                + "      <td align='center'>"
                + "        <table width='500' cellpadding='0' cellspacing='0' style='background-color:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.06);overflow:hidden;border:1px solid #e5e7eb;'>"
                + "          <tr>"
                + "            <td style='background:linear-gradient(135deg, #10b981, #059669);padding:24px;text-align:center;'>"
                + "              <h1 style='color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;font-weight:700;'>SHEPRENURE</h1>"
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style='padding:32px 28px;text-align:center;'>"
                + "              <h2 style='color:#111827;font-size:20px;margin:0 0 10px 0;font-weight:600;'>" + title + "</h2>"
                + "              <p style='color:#4b5563;font-size:14px;margin:0 0 24px 0;line-height:1.5;'>" + subtitle + "</p>"
                + "              <div style='background-color:#ecfdf5;border:2px dashed #10b981;border-radius:8px;padding:16px 24px;display:inline-block;margin-bottom:24px;'>"
                + "                <span style='font-size:32px;font-weight:bold;letter-spacing:6px;color:#047857;font-family:Courier,monospace;'>" + otp + "</span>"
                + "              </div>"
                + "              <p style='color:#6b7280;font-size:13px;margin:0 0 8px 0;'>This verification code will expire in <strong>" + expiryMinutes + " minutes</strong>.</p>"
                + "              <p style='color:#9ca3af;font-size:12px;margin:0;'>If you did not request this email, please ignore it.</p>"
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style='background-color:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;'>"
                + "              <p style='color:#9ca3af;font-size:11px;margin:0;'>&copy; " + java.time.Year.now().getValue() + " Sheprenure. All rights reserved.</p>"
                + "            </td>"
                + "          </tr>"
                + "        </table>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</body>"
                + "</html>";

        String text = "SHEPRENURE - " + title + "\n\n"
                + subtitle + "\n\n"
                + "Your OTP is: " + otp + "\n\n"
                + "This OTP is valid for " + expiryMinutes + " minutes. Please do not share this code with anyone.\n\n"
                + "If you did not request this, please ignore this email.";

        return sendHtmlEmail(toEmail, "SHEPRENURE - " + title, html, text);
    }
}
