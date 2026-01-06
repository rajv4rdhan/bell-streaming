package com.bellstreaming.thumbnailgenerator.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class FreepikService {

    private static final Logger log = LoggerFactory.getLogger(FreepikService.class);
    private final WebClient webClient;

    @Value("${freepik.api.key}")
    private String apiKey;

    @Value("${freepik.api.url}")
    private String apiUrl;

    public FreepikService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }

    public Mono<String> generateImage(String videoId, String prompt, String webhookUrl) {
        log.info("New thumbnail generation request received - videoId: {}, prompt: '{}', webhookUrl: {}", 
                videoId, prompt, webhookUrl);
        
        Map<String, Object> body = Map.of(
                "prompt", prompt,
                "prompt_upsampling", false,
                "seed", 123,
                "aspect_ratio", "widescreen_16_9",
                "safety_tolerance", 2,
                "output_format", "jpeg",
                "webhook_url", webhookUrl
        );

        return this.webClient.post()
                .uri(apiUrl)
                .header("x-freepik-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class);
    }
}
