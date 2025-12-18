package com.bellstreaming.thumbnailgenerator.dto;

import lombok.Data;

@Data
public class ThumbnailRequest {
    private String videoId;
    private String prompt;
    private String webhookUrl;
}
