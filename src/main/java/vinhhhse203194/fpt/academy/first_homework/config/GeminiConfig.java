package vinhhhse203194.fpt.academy.first_homework.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.url}")
    private String apiUrl;

    // Tạo WebClient Bean để gọi Gemini API
    @Bean
    public WebClient geminiWebClient() {
        return WebClient.builder()
                .baseUrl(apiUrl)
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer cho response lớn
                .build();
    }
}
