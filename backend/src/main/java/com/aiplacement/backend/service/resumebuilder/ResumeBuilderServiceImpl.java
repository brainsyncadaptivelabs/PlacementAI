package com.aiplacement.backend.service.resumebuilder;

import com.aiplacement.backend.dto.resumebuilder.ResumeBuilderRequestDto;
import com.aiplacement.backend.dto.resumebuilder.ResumeBuilderResponseDto;
import com.aiplacement.backend.entity.ResumeBuilder;
import com.aiplacement.backend.repository.ResumeBuilderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeBuilderServiceImpl implements ResumeBuilderService {

    private final ResumeBuilderRepository resumeBuilderRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ResumeBuilderRequestDto mapToDto(ResumeBuilder resume) {
        return ResumeBuilderRequestDto.builder()
                .id(resume.getId())
                .title(resume.getTitle())
                .templateName(resume.getTemplateName())
                .fullName(resume.getFullName())
                .email(resume.getEmail())
                .phone(resume.getPhone())
                .linkedin(resume.getLinkedin())
                .github(resume.getGithub())
                .summary(resume.getSummary())
                .skills(resume.getSkills())
                .projects(resume.getProjects())
                .experience(resume.getExperience())
                .certifications(resume.getCertifications())
                .education(resume.getEducation())
                .build();
    }

    @Override
    public ResumeBuilderResponseDto createResume(ResumeBuilderRequestDto request) {
        User user = getAuthenticatedUser();
        ResumeBuilder resume = ResumeBuilder.builder()
                .title(request.getTitle())
                .templateName(request.getTemplateName())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .linkedin(request.getLinkedin())
                .github(request.getGithub())
                .summary(request.getSummary())
                .skills(request.getSkills())
                .projects(request.getProjects())
                .experience(request.getExperience())
                .certifications(request.getCertifications())
                .education(request.getEducation())
                .user(user)
                .build();

        ResumeBuilder savedResume = resumeBuilderRepository.save(resume);
        return new ResumeBuilderResponseDto(savedResume.getId(), "Resume created successfully");
    }

    @Override
    public List<ResumeBuilderRequestDto> getAllResumes() {
        User user = getAuthenticatedUser();
        return resumeBuilderRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ResumeBuilderRequestDto getResumeById(Long id) {
        ResumeBuilder resume = resumeBuilderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
        return mapToDto(resume);
    }

    @Override
    public ResumeBuilderResponseDto updateResume(Long resumeId, ResumeBuilderRequestDto request) {
        ResumeBuilder resume = resumeBuilderRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        resume.setTitle(request.getTitle());
        resume.setTemplateName(request.getTemplateName());
        resume.setFullName(request.getFullName());
        resume.setEmail(request.getEmail());
        resume.setPhone(request.getPhone());
        resume.setLinkedin(request.getLinkedin());
        resume.setGithub(request.getGithub());
        resume.setSummary(request.getSummary());
        resume.setSkills(request.getSkills());
        resume.setProjects(request.getProjects());
        resume.setExperience(request.getExperience());
        resume.setCertifications(request.getCertifications());
        resume.setEducation(request.getEducation());

        ResumeBuilder savedResume = resumeBuilderRepository.save(resume);

        return new ResumeBuilderResponseDto(
                savedResume.getId(),
                "Resume updated successfully"
        );
    }

    @Override
    public void deleteResume(Long resumeId) {
        ResumeBuilder resume = resumeBuilderRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        resumeBuilderRepository.delete(resume);
    }
}
