package com.devpilot.analysis;

import java.nio.file.Path;

public interface StaticAnalyzer {

    /**
     * @return The analysis engine identifying this runner.
     */
    AnalysisEngine getEngine();

    /**
     * Executes static analysis on the target repository or path.
     *
     * @param repositoryPath Root directory of the repository.
     * @param branch Target branch name.
     * @return EngineAnalysisResult containing normalized findings and execution telemetry.
     */
    EngineAnalysisResult analyze(Path repositoryPath, String branch);
}
