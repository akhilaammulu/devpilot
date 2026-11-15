package com.devpilot.analysis;

import java.nio.file.Path;
import java.util.List;

public interface StaticAnalyzer {

    /**
     * @return The analysis engine identifying this runner.
     */
    AnalysisEngine getEngine();

    /**
     * Executes static analysis on the target repository or path.
     *
     * @param repositoryPath Root directory of the repository (may be null if scanning virtual repository).
     * @param branch Target branch name.
     * @return List of normalized static analysis findings.
     */
    List<AnalysisFinding> analyze(Path repositoryPath, String branch);
}
