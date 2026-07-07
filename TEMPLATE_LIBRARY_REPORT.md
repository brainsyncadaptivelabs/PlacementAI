# TEMPLATE_LIBRARY_REPORT (9 Templates Version)

## Summary of Imported Templates

A total of 9 premium resume templates have been structured into the PlacementAI template library system:

| Template ID | Name | Category | SubCategory | Original PDF | ATS Score | Complexity | Best For / Use Cases |
|---|---|---|---|---|---|---|---|
| `professional-ats` | Professional ATS | ATS Resume Templates | Professional | `Professional.pdf` | 94 | Low | Entry-level roles, general engineering, clean ATS standard |
| `classic-ats` | Classic ATS | ATS Resume Templates | Classic | `Classic.pdf` | 95 | Low | Entry-level roles, campus placements, classic layouts |
| `experienced-ats` | Experienced ATS | ATS Resume Templates | Experienced | `Experienced.pdf` | 98 | High | Tech leads, senior developers, product target resumes |
| `modern` | Modern | ATS Resume Templates | Modern | `Modern.pdf` | 96 | Medium | Engineering, design and product management roles |
| `ats` | ATS | ATS Resume Templates | ATS | `ATS.pdf` | 98 | Low | Technical roles, QA engineers, high compatibility standards |
| `accenture-style` | Accenture | Company Based Resume Templates | Accenture | `Accenture.pdf` | 95 | Medium | Accenture hiring, full-stack, Agile teamwork focus |
| `tcs-style` | TCS | Company Based Resume Templates | TCS | `TCS.pdf` | 95 | Low | TCS Ninja/Digital hiring, OOP Java foundational focus |
| `cognizant-style` | Cognizant | Company Based Resume Templates | Cognizant | `Cognizant.pdf` | 96 | Medium | Cognizant hiring, enterprise Java Spring Boot/Angular focus |
| `faang-style` | FAANG | Company Based Resume Templates | FAANG | `FAANG.pdf` | 98 | High | Tier 1/FAANG hiring, metrics driven backend system design focus |

---

## Design Decisions & Guidelines

1. **Original PDF Names**: All reference PDF files have been named exactly as requested (`Professional.pdf`, `Classic.pdf`, `Experienced.pdf`, `Modern.pdf`, `ATS.pdf`, `Accenture.pdf`, `TCS.pdf`, `Cognizant.pdf`, `FAANG.pdf`) and remain completely unmodified.
2. **Rotated Candidates Names**: Inside templates and registry initial state setups, we rotate candidates:
   - `Abhinav` (Professional ATS, Modern, TCS)
   - `Bharath` (Classic ATS, ATS, Cognizant)
   - `Likith` (Experienced ATS, FAANG)
   - `Sree Alekhya` (Accenture)
3. **Dynamic Rendering**: All 9 templates are fully registered and render dynamically through the theme-aware and layout-aware `TemplateEngine.tsx` within the Resume Editor and live preview modal.
