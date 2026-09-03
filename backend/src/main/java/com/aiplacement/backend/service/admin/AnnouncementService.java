package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.announcement.*;
import com.aiplacement.backend.entity.Announcement;
import org.springframework.data.domain.Page;



public interface AnnouncementService {
    Page<Announcement> getAnnouncements(int page, int size);
    Announcement createAnnouncement(CreateAnnouncementRequest request, String adminEmail, String userRole);
    Announcement approveAnnouncement(Long id, String superAdminEmail);
    PublicActiveBannerResponse getActivePublicBanner();
    void updateMaintenanceMode(MaintenanceModeRequest request, String superAdminEmail);
}
