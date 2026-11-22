package com.devpilot.ai;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import com.devpilot.repository.IssueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AiAnalysisServiceTest {

    private IssueRepository issueRepository;
    private LlmClient llmClient;
    private AiAnalysisService aiService;

    @BeforeEach
    void setUp() {
        issueRepository = mock(IssueRepository.class);
        CodeContextAnalysisEngine engine = new CodeContextAnalysisEngine();
        llmClient = new LlmClient(engine);
        aiService = new AiAnalysisService(issueRepository, llmClient);
    }

    @Test
    void testExplainIssuePersistsAiFields() {
        UUID issueId = UUID.randomUUID();
        Issue issue = new Issue();
        issue.setId(issueId);
        issue.setRuleId("SEC_CSRF_DISABLED");
        issue.setCategory(IssueCategory.SECURITY);
        issue.setSeverity(IssueSeverity.HIGH);
        issue.setMessage("CSRF protection disabled");
        issue.setFilePath("SecurityConfig.java");

        when(issueRepository.findById(issueId)).thenReturn(Optional.of(issue));
        when(issueRepository.save(any(Issue.class))).thenReturn(issue);

        AiIssueAnalysis analysis = aiService.explainIssue(issueId);

        assertNotNull(analysis);
        assertEquals("SEC_CSRF_DISABLED", analysis.getRuleId());
        assertTrue(analysis.getWhyItMatters().contains("CSRF"));
        assertNotNull(analysis.getCodeFix());
        assertNotNull(analysis.getSuggestedUnitTest());

        // Verify Issue was updated with AI analysis
        verify(issueRepository, times(1)).save(issue);
        assertNotNull(issue.getAiExplanation());
        assertNotNull(issue.getAiFixSuggestion());
        assertNotNull(issue.getAiSuggestedUnitTest());
        assertNotNull(issue.getAiModelUsed());
    }
}
