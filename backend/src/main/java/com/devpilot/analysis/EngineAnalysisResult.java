package com.devpilot.analysis;

import com.devpilot.model.EngineExecutionReport;

import java.util.List;

public class EngineAnalysisResult {

    private final AnalysisEngine engine;
    private final List<AnalysisFinding> findings;
    private final EngineExecutionReport report;

    public EngineAnalysisResult(AnalysisEngine engine, List<AnalysisFinding> findings, EngineExecutionReport report) {
        this.engine = engine;
        this.findings = findings;
        this.report = report;
    }

    public AnalysisEngine getEngine() {
        return engine;
    }

    public List<AnalysisFinding> getFindings() {
        return findings;
    }

    public EngineExecutionReport getReport() {
        return report;
    }
}
