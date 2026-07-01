package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.CompanyWorkspaceDto;
import com.aiplacement.backend.entity.CompanyProfile;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.CompanyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyWorkspaceService {

    private final CompanyProfileRepository companyProfileRepository;

    public CompanyWorkspaceDto getWorkspace(Long recruiterId) {
        return companyProfileRepository.findByRecruiterId(recruiterId)
                .map(this::toDto)
                .orElse(null);
    }

    @Transactional
    public CompanyWorkspaceDto upsertWorkspace(CompanyWorkspaceDto dto, User recruiter) {
        CompanyProfile profile = companyProfileRepository
                .findByRecruiterId(recruiter.getId())
                .orElse(CompanyProfile.builder().recruiter(recruiter).build());

        if (dto.getCompanyName() != null)       profile.setCompanyName(dto.getCompanyName());
        if (dto.getLogoUrl() != null)            profile.setLogoUrl(dto.getLogoUrl());
        if (dto.getIndustry() != null)           profile.setIndustry(dto.getIndustry());
        if (dto.getDescription() != null)        profile.setDescription(dto.getDescription());
        if (dto.getCompanySize() != null)        profile.setCompanySize(dto.getCompanySize());
        if (dto.getHeadquarters() != null)       profile.setHeadquarters(dto.getHeadquarters());
        if (dto.getOfficeLocations() != null)    profile.setOfficeLocations(dto.getOfficeLocations());
        if (dto.getCareersWebsite() != null)     profile.setCareersWebsite(dto.getCareersWebsite());
        if (dto.getLinkedinUrl() != null)        profile.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getHiringManagerDetails() != null) profile.setHiringManagerDetails(dto.getHiringManagerDetails());
        if (dto.getHiringPreferences() != null) profile.setHiringPreferences(dto.getHiringPreferences());
        if (dto.getCompanyCulture() != null)     profile.setCompanyCulture(dto.getCompanyCulture());
        if (dto.getBenefits() != null)           profile.setBenefits(dto.getBenefits());

        return toDto(companyProfileRepository.save(profile));
    }

    private CompanyWorkspaceDto toDto(CompanyProfile p) {
        return CompanyWorkspaceDto.builder()
                .id(p.getId())
                .recruiterId(p.getRecruiter().getId())
                .companyName(p.getCompanyName())
                .logoUrl(p.getLogoUrl())
                .industry(p.getIndustry())
                .description(p.getDescription())
                .companySize(p.getCompanySize())
                .headquarters(p.getHeadquarters())
                .officeLocations(p.getOfficeLocations())
                .careersWebsite(p.getCareersWebsite())
                .linkedinUrl(p.getLinkedinUrl())
                .hiringManagerDetails(p.getHiringManagerDetails())
                .hiringPreferences(p.getHiringPreferences())
                .companyCulture(p.getCompanyCulture())
                .benefits(p.getBenefits())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
