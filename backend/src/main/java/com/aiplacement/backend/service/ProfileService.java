package com.aiplacement.backend.service;

import com.aiplacement.backend.dto.user.CompleteProfileRequest;
import com.aiplacement.backend.dto.user.UserProfileDto;

public interface ProfileService {
    void completeStudentProfile(CompleteProfileRequest request);
    void completeRecruiterProfile(CompleteProfileRequest request);
    UserProfileDto getMyProfile();
    UserProfileDto getPublicProfileById(Long id);
    void updateProfile(CompleteProfileRequest request);
}