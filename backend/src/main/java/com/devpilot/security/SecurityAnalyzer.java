package com.devpilot.security;

import com.devpilot.analysis.AnalysisEngine;
import com.devpilot.analysis.EngineAnalysisResult;

import java.nio.file.Path;

/**
 * Common contract for security analysis engines (Dependencies, Secrets, Unsafe Configurations).
 */
public interface SecurityAnalyzer {

    /**
     * @return The security analysis engine identifying this runner.
     */
    AnalysisEngine getEngine();

    /**
     * Executes security analysis on the target repository or directory.
     *
     * @param repositoryPath Root directory of the repository.
     * @param branch Target branch name.
     * @return EngineAnalysisResult containing normalized security findings and execution telemetry.
     */
    EngineAnalysisResult analyze(Path repositoryPath, String branch);
}
