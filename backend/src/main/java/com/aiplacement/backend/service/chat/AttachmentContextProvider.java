package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.ai.multimodal.MultimodalRouter;
import com.aiplacement.backend.ai.multimodal.AnalysisResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AttachmentContextProvider implements ChatContextProvider {

    private final MultimodalRouter multimodalRouter = new MultimodalRouter();

    @Override
    public String provideContext(AISessionContext sessionContext) {
        if (sessionContext.getAttachments() == null || sessionContext.getAttachments().isEmpty()) {
            return "";
        }

        List<AnalysisResult> analysisResults = multimodalRouter.routeAttachments(sessionContext.getAttachments());
        if (analysisResults == null || analysisResults.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("\n=========================================\n");
        sb.append("ACTIVE ATTACHMENTS ANALYSIS (INJECTED DOCUMENT CONTEXT):\n");
        for (AnalysisResult res : analysisResults) {
            sb.append("- Document Summary: ").append(res.getSummary()).append("\n");
            sb.append("- Key Findings / Content Points:\n");
            for (String p : res.getKeyFindings()) {
                sb.append("  * ").append(p).append("\n");
            }
            sb.append("- Recommendations / Actions:\n");
            for (String r : res.getRecommendations()) {
                sb.append("  * ").append(r).append("\n");
            }
            if (res.getSuggestedWidgets() != null && !res.getSuggestedWidgets().isEmpty()) {
                sb.append("- Suggested Dashboard Widgets: ").append(String.join(", ", res.getSuggestedWidgets())).append("\n");
            }
            if (res.getFollowUps() != null && !res.getFollowUps().isEmpty()) {
                sb.append("- Recommended Next Steps:\n");
                for (String f : res.getFollowUps()) {
                    sb.append("  * ").append(f).append("\n");
                }
            }
            if (res.getTags() != null && !res.getTags().isEmpty()) {
                sb.append("- Context Tags: ").append(String.join(", ", res.getTags())).append("\n");
            }
            sb.append("\n");
        }
        sb.append("=========================================\n\n");
        return sb.toString();
    }

    @Override
    public String getName() {
        return "AttachmentContext";
    }
}
