package com.bellstreaming.thumbnailgenerator.controller;

import com.bellstreaming.thumbnailgenerator.dto.ThumbnailRequest;
import com.bellstreaming.thumbnailgenerator.service.FreepikService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/thumbnail")
public class ThumbnailController {

    private final FreepikService freepikService;

    public ThumbnailController(FreepikService freepikService) {
        this.freepikService = freepikService;
    }

    @PostMapping("/generate")
    public Mono<ResponseEntity<String>> generateThumbnail(@RequestBody ThumbnailRequest request) {
        return freepikService.generateImage(request.getPrompt())
                .map(response -> ResponseEntity.ok().body(response));
    }
}
