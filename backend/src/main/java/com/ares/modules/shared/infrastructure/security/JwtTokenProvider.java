package com.ares.modules.shared.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

/**
 * JWT Token Provider - Shared security component.
 * Used by auth module and security filters.
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    private SecretKeySpec getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            keyBytes = paddedKey;
        }
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = String.format("{\"sub\":\"%s\",\"iat\":%d,\"exp\":%d}",
                username, now.getTime() / 1000, expiryDate.getTime() / 1000);

        String base64UrlHeader = base64UrlEncode(header.getBytes(StandardCharsets.UTF_8));
        String base64UrlPayload = base64UrlEncode(payload.getBytes(StandardCharsets.UTF_8));

        String data = base64UrlHeader + "." + base64UrlPayload;
        String signature = createSignature(data);

        return data + "." + signature;
    }

    public String getUsernameFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }
            String payload = new String(base64UrlDecode(parts[1]), StandardCharsets.UTF_8);
            int subIndex = payload.indexOf("\"sub\":\"");
            if (subIndex == -1) {
                return null;
            }
            int start = subIndex + 7;
            int end = payload.indexOf("\"", start);
            if (end == -1) {
                return null;
            }
            return payload.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }

    public Date getExpirationDateFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }
            String payload = new String(base64UrlDecode(parts[1]), StandardCharsets.UTF_8);
            int expIndex = payload.indexOf("\"exp\":");
            if (expIndex == -1) {
                return null;
            }
            int start = expIndex + 6;
            int end = payload.indexOf(",", start);
            if (end == -1) {
                end = payload.indexOf("}", start);
            }
            if (end == -1) {
                return null;
            }
            long exp = Long.parseLong(payload.substring(start, end).trim());
            return new Date(exp * 1000);
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }

            String data = parts[0] + "." + parts[1];
            String signature = createSignature(data);
            if (!signature.equals(parts[2])) {
                return false;
            }

            Date expiration = getExpirationDateFromToken(token);
            if (expiration == null || expiration.before(new Date())) {
                return false;
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String createSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(getSigningKey());
            byte[] signatureBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(signatureBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error creating signature", e);
        }
    }

    private String base64UrlEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] base64UrlDecode(String data) {
        return Base64.getUrlDecoder().decode(data);
    }
}

