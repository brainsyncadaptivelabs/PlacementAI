# TEMPLATE_LIBRARY_REPORT (7 Templates Version)

## Summary of Imported Templates

A total of 7 premium resume templates have been structured into the PlacementAI template library system:

| Template ID | Name | Category | SubCategory | Original PDF | ATS Score | Complexity | Best For / Use Cases |
|---|---|---|---|---|---|---|---|
| `professional-ats` | Professional ATS | ATS Resume Templates | Professional | `Professional.pdf` | 94 | Low | Entry-level roles, general engineering, clean ATS standard |
| `classic-ats` | Classic ATS | ATS Resume Templates | Classic | `Classic.pdf` | 95 | Low | Entry-level roles, campus placements, classic layouts |
| `experienced-ats` | Experienced ATS | ATS Resume Templates | Experienced | `Experienced.pdf` | 98 | High | Tech leads, senior developers, product target resumes |
| `accenture-style` | Accenture Style | Company Based Resume Templates | Backend | `Accenture.pdf` | 95 | Medium | Java, Spring Boot, backend frameworks |
| `tcs-style` | TCS Style | Company Based Resume Templates | Fresher | `TCS.pdf` | 95 | Low | Entry-level services hiring, TCS Ninja/Digital targets |
| `cognizant-style` | Cognizant Style | Company Based Resume Templates | Professional | `Cognizant.pdf` | 96 | Medium | Junior Full Stack Engineers, service industries |
| `faang-style` | FAANG Style | Company Based Resume Templates | Executive | `FAANG.pdf` | 98 | High | Senior Software Engineers, FAANG, system design roles |

---

## Design Decisions & Guidelines

1. **Original PDF Names**: All reference PDF files have been named exactly as requested (`Professional.pdf`, `Classic.pdf`, etc.) and remain completely unmodified.
2. **Rotated Candidates Names**: Inside templates and registry initial state setups, we have removed "Aarav Sharma" and rotated:
   - `Abhinav` (Professional ATS, TCS Style)
   - `Bharath` (Classic ATS, Cognizant Style)
   - `Likith` (Experienced ATS, FAANG Style)
   - `Sree Alekhya` (Accenture Style)
3. **Dynamic Rendering**: All 7 templates are fully registered and render dynamically through the theme-aware and layout-aware `TemplateEngine.tsx` within the Resume Editor and live preview modal.
