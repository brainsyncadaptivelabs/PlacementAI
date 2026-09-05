import api from '@/lib/api';

const toRequestDto = (data: any) => {
  const state = data.resume_data || {};
  return {
    title: data.title || "Untitled Resume",
    templateName: data.template_id || "placementai-educator",
    fullName: state.personalInfo?.name || "",
    email: state.personalInfo?.email || "",
    phone: state.personalInfo?.phone || "",
    linkedin: state.personalInfo?.linkedin || "",
    github: state.personalInfo?.github || "",
    summary: state.summary || "",
    skills: JSON.stringify(state.skills || []),
    projects: JSON.stringify(state.projects || []),
    experience: JSON.stringify(state.experience || []),
    certifications: JSON.stringify(state.certifications || []),
    education: JSON.stringify(state.education || [])
  };
};

const safeParseJSON = (str: string | null | undefined, fallback: any = []) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

const toFrontendResume = (dto: any) => {
  return {
    id: String(dto.id),
    title: dto.title,
    template_id: dto.templateName,
    resume_data: {
      personalInfo: {
        name: dto.fullName || "",
        email: dto.email || "",
        phone: dto.phone || "",
        linkedin: dto.linkedin || "",
        github: dto.github || "",
        leetcode: ""
      },
      summary: dto.summary || "",
      skills: safeParseJSON(dto.skills, []),
      projects: safeParseJSON(dto.projects, []),
      experience: safeParseJSON(dto.experience, []),
      certifications: safeParseJSON(dto.certifications, []),
      education: safeParseJSON(dto.education, []),
      achievements: []
    }
  };
};

export const ResumeService = {
  async createResume(data: any) {
    const dto = toRequestDto(data);
    const response = await api.post('/resume-builder', dto);
    return { id: response.data.id };
  },

  async getResume(id: string) {
    const response = await api.get(`/resume-builder/${id}`);
    return toFrontendResume(response.data);
  },

  async getAllResumes(userId: string) {
    const response = await api.get('/resume-builder');
    if (Array.isArray(response.data)) {
      return response.data.map(toFrontendResume);
    }
    return [];
  },

  async updateResume(id: string, data: any) {
    const dto = toRequestDto(data);
    const response = await api.put(`/resume-builder/${id}`, dto);
    return { id: response.data.id };
  },

  async deleteResume(id: string) {
    await api.delete(`/resume-builder/${id}`);
    return true;
  },

  async saveVersion(resumeId: string, versionNumber: number, resumeData: any) {
    console.warn("saveVersion not implemented on Spring Boot backend yet");
    return null;
  }
};
