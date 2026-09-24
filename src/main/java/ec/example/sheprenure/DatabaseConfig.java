package ec.example.sheprenure;

import javax.sql.DataSource;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import java.net.URI;

/**
 * Universal Database Configuration:
 * Supports Supabase / PostgreSQL and local MySQL seamlessly.
 *
 * Automatically handles:
 * - Bare hostnames: aws-0-ap-south-1.pooler.supabase.com -> jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
 * - Full URI with credentials: postgresql://user:pass@host:6543/postgres -> extracts user/pass and builds valid JDBC URL
 * - Standard JDBC URL: jdbc:postgresql://host:port/postgres?sslmode=require
 * - Local MySQL fallback: jdbc:mysql://localhost:3306/sheprenure
 */
@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource dataSource(Environment env) {
        String rawUrl = getFirstNotEmpty(env,
                "SPRING_DATASOURCE_URL",
                "DB_URL",
                "DATABASE_URL",
                "spring.datasource.url");

        String username = getFirstNotEmpty(env,
                "SPRING_DATASOURCE_USERNAME",
                "DB_USERNAME",
                "DATABASE_USERNAME",
                "spring.datasource.username");

        String password = getFirstNotEmpty(env,
                "SPRING_DATASOURCE_PASSWORD",
                "DB_PASSWORD",
                "DATABASE_PASSWORD",
                "spring.datasource.password");

        String jdbcUrl = rawUrl != null ? rawUrl.trim() : "";

        // 1. If user only gave the hostname (e.g. aws-0-ap-south-1.pooler.supabase.com)
        if (!jdbcUrl.isBlank() && !jdbcUrl.contains("://") && jdbcUrl.contains("supabase.co")) {
            String host = jdbcUrl;
            int port = 6543;
            if (host.contains(":")) {
                String[] parts = host.split(":");
                host = parts[0];
                try {
                    port = Integer.parseInt(parts[1]);
                } catch (Exception ignored) {}
            }
            jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/postgres?sslmode=require";
        }
        // 2. If user provided a raw URI with or without credentials (postgresql://... or postgres://...)
        else if (jdbcUrl.startsWith("postgres://") || jdbcUrl.startsWith("postgresql://")) {
            try {
                URI uri = URI.create(jdbcUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isBlank()) {
                    String[] userParts = userInfo.split(":", 2);
                    if (username == null || username.isBlank()) {
                        username = userParts[0];
                    }
                    if (userParts.length > 1 && (password == null || password.isBlank())) {
                        password = userParts[1];
                    }
                }

                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = (uri.getPath() != null && !uri.getPath().isBlank() && !uri.getPath().equals("/"))
                        ? uri.getPath()
                        : "/postgres";
                String query = uri.getQuery();

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (query != null && !query.isBlank()) {
                    jdbcUrl += "?" + query;
                    if (!jdbcUrl.contains("sslmode")) {
                        jdbcUrl += "&sslmode=require";
                    }
                } else {
                    jdbcUrl += "?sslmode=require";
                }
            } catch (Exception e) {
                // Fallback to simple string replacement if URI parsing fails
                if (jdbcUrl.startsWith("postgres://")) {
                    jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgres://".length());
                } else if (jdbcUrl.startsWith("postgresql://")) {
                    jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgresql://".length());
                }
            }
        }
        // 3. If standard JDBC PostgreSQL URL, ensure sslmode=require for Supabase
        else if (jdbcUrl.startsWith("jdbc:postgresql:") && jdbcUrl.contains("supabase.co") && !jdbcUrl.contains("sslmode")) {
            jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
        }
        // 4. Default to local MySQL if empty
        else if (jdbcUrl.isBlank()) {
            jdbcUrl = "jdbc:mysql://localhost:3306/sheprenure";
        }

        if (username == null || username.isBlank()) {
            username = "root";
        }
        if (password == null) {
            password = "sarath 1577 7999";
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(username);
        ds.setPassword(password);

        if (jdbcUrl.startsWith("jdbc:postgresql:") || jdbcUrl.contains("supabase.co") || jdbcUrl.contains("postgres")) {
            ds.setDriverClassName("org.postgresql.Driver");
            System.out.println("[DatabaseConfig] Configured PostgreSQL DataSource (org.postgresql.Driver) for: " + maskUrl(jdbcUrl));
        } else if (jdbcUrl.startsWith("jdbc:mysql:")) {
            ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
            System.out.println("[DatabaseConfig] Configured MySQL DataSource (com.mysql.cj.jdbc.Driver) for: " + maskUrl(jdbcUrl));
        }

        return ds;
    }

    private static String getFirstNotEmpty(Environment env, String... keys) {
        for (String key : keys) {
            String val = env.getProperty(key);
            if (val != null && !val.isBlank()) {
                return val.trim();
            }
        }
        return null;
    }

    private static String maskUrl(String url) {
        if (url == null) return "";
        return url.replaceAll("://.*@", "://***:***@");
    }
}
