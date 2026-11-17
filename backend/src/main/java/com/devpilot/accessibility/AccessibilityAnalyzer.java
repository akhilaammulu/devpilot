package com.devpilot.accessibility;

import com.devpilot.analysis.AnalysisEngine;
import com.devpilot.analysis.EngineAnalysisResult;

import java.nio.file.Path;

/**
 * Strategy interface for accessibility analyzers (Phase 4).
 */
public interface AccessibilityAnalyzer {

    AnalysisEngine getEngine();

    EngineAnalysisResult analyze(Path repositoryPath, String targetUrl);
}
