package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.admin.announcement.PublicActiveBannerResponse;
import com.aiplacement.backend.service.admin.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PublicAnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping("/active-banner")
    public ResponseEntity<PublicActiveBannerResponse> getActivePublicBanner() {
        return ResponseEntity.ok(announcementService.getActivePublicBanner());
    }
}
