package com.devpilot.ai;

import com.devpilot.model.Issue;
import com.devpilot.model.IssueCategory;
import com.devpilot.model.IssueSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CodeContextAnalysisEngineTest {

    private CodeContextAnalysisEngine engine;

    @BeforeEach
    void setUp() {
        engine = new CodeContextAnalysisEngine();
    }

    @Test
    void testExplainsNullPointerDereferenceWithRegressionTest(@TempDir Path tempDir) throws IOException {
        Path src = tempDir.resolve("UserService.java");
        Files.writeString(src, """
            public class UserService {
                public String getUserCity(User user) {
                    return user.getAddress().getCity();
                }
            }
            """);

        Issue issue = new Issue();
        issue.setId(UUID.randomUUID());
        issue.setRuleId("NP_NULL_ON_SOME_PATH");
        issue.setCategory(IssueCategory.CODE_QUALITY);
        issue.setSeverity(IssueSeverity.CRITICAL);
        issue.setFilePath("UserService.java");
        issue.setLineStart(3);
        issue.setLineEnd(3);
        issue.setMessage("Possible null pointer dereference of user.getAddress()");

        AiIssueAnalysis analysis = engine.analyze(issue, tempDir);

        assertNotNull(analysis);
        assertEquals("NP_NULL_ON_SOME_PATH", analysis.getRuleId());
        assertTrue(analysis.getWhyItMatters().contains("NullPointerDereference"));
        assertTrue(analysis.getRemediationGuidance().contains("Optional"));
        assertTrue(analysis.getCodeFix().contains("Optional.ofNullable"));
        assertTrue(analysis.getSuggestedUnitTest().contains("@Test"));
        assertTrue(analysis.getSuggestedUnitTest().contains("assertDoesNotThrow"));
        assertEquals("DevPilot-AI-Engine-v2", analysis.getModelUsed());
    }

    @Test
    void testExplainsSqlInjectionWithMaliciousPayloadRegressionTest(@TempDir Path tempDir) throws IOException {
        Path src = tempDir.resolve("OrderRepository.java");
        Files.writeString(src, """
            public class OrderRepository {
                public List<Order> findOrders(String customerId) {
                    String sql = "SELECT * FROM orders WHERE customer_id = '" + customerId + "'";
                    return query(sql);
                }
            }
            """);

        Issue issue = new Issue();
        issue.setId(UUID.randomUUID());
        issue.setRuleId("SQL_INJECTION");
        issue.setCategory(IssueCategory.SECURITY);
        issue.setSeverity(IssueSeverity.CRITICAL);
        issue.setFilePath("OrderRepository.java");
        issue.setLineStart(3);
        issue.setLineEnd(3);
        issue.setMessage("SQL Injection via unparameterized string concatenation");

        AiIssueAnalysis analysis = engine.analyze(issue, tempDir);

        assertNotNull(analysis);
        assertTrue(analysis.getWhyItMatters().contains("SQL Injection"));
        assertTrue(analysis.getCodeFix().contains("PreparedStatement") || analysis.getCodeFix().contains(":email") || analysis.getCodeFix().contains("setParameter"));
        assertTrue(analysis.getSuggestedUnitTest().contains("' OR '1'='1'"));
    }

    @Test
    void testExplainsAccessibilityButtonNameViolation(@TempDir Path tempDir) throws IOException {
        Path src = tempDir.resolve("Header.tsx");
        Files.writeString(src, "<button className=\"p-2\"><Moon /></button>");

        Issue issue = new Issue();
        issue.setId(UUID.randomUUID());
        issue.setRuleId("AXE_BUTTON_NAME");
        issue.setCategory(IssueCategory.ACCESSIBILITY);
        issue.setSeverity(IssueSeverity.CRITICAL);
        issue.setFilePath("Header.tsx");
        issue.setLineStart(1);
        issue.setLineEnd(1);
        issue.setMessage("WCAG 2.1 A (4.1.2): Button is missing discernible text");

        AiIssueAnalysis analysis = engine.analyze(issue, tempDir);

        assertNotNull(analysis);
        assertTrue(analysis.getWhyItMatters().contains("WCAG 2.1 A"));
        assertTrue(analysis.getCodeFix().contains("aria-label"));
        assertTrue(analysis.getSuggestedUnitTest().contains("test("));
    }
}
