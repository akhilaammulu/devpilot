package com.devpilot.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.net.URI;

@Controller
public class BackendWebController {

    /**
     * Root Status Page at http://localhost:8080/
     */
    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getRootDashboard() {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevPilot Backend — Core API Engine</title>
                <style>
                    :root {
                        --bg: #0b0f19;
                        --card-bg: #121829;
                        --border: #1e293b;
                        --primary: #8b5cf6;
                        --accent: #ec4899;
                        --emerald: #10b981;
                        --text: #f8fafc;
                        --text-muted: #94a3b8;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background: var(--bg);
                        color: var(--text);
                        margin: 0;
                        padding: 0;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                    .container {
                        max-width: 800px;
                        width: 90%;
                        background: var(--card-bg);
                        border: 1px solid var(--border);
                        border-radius: 24px;
                        padding: 36px;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border-bottom: 1px solid var(--border);
                        padding-bottom: 24px;
                        margin-bottom: 24px;
                    }
                    .logo-wrap {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    .logo {
                        width: 48px;
                        height: 48px;
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 900;
                        font-family: monospace;
                        font-size: 20px;
                        color: #fff;
                    }
                    h1 {
                        margin: 0;
                        font-size: 24px;
                        letter-spacing: -0.5px;
                    }
                    .badge-online {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: rgba(16, 185, 129, 0.15);
                        color: var(--emerald);
                        border: 1px solid rgba(16, 185, 129, 0.3);
                        padding: 6px 14px;
                        border-radius: 9999px;
                        font-size: 13px;
                        font-weight: 700;
                    }
                    .pulse {
                        width: 8px;
                        height: 8px;
                        background: var(--emerald);
                        border-radius: 50%;
                        animation: pulse 1.5s infinite;
                    }
                    @keyframes pulse {
                        0% { transform: scale(0.95); opacity: 0.7; }
                        50% { transform: scale(1.2); opacity: 1; }
                        100% { transform: scale(0.95); opacity: 0.7; }
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 16px;
                        margin-bottom: 28px;
                    }
                    .card {
                        background: #0e1322;
                        border: 1px solid var(--border);
                        border-radius: 16px;
                        padding: 16px;
                    }
                    .card-title {
                        font-size: 12px;
                        color: var(--text-muted);
                        text-transform: uppercase;
                        font-weight: 700;
                        margin-bottom: 6px;
                    }
                    .card-value {
                        font-size: 15px;
                        font-weight: 600;
                        color: #fff;
                    }
                    .actions {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 12px;
                        margin-top: 24px;
                    }
                    .btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 22px;
                        border-radius: 14px;
                        font-size: 14px;
                        font-weight: 700;
                        text-decoration: none;
                        transition: all 0.2s ease;
                    }
                    .btn-primary {
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        color: #fff;
                    }
                    .btn-primary:hover {
                        opacity: 0.92;
                        transform: translateY(-1px);
                    }
                    .btn-secondary {
                        background: #1e293b;
                        color: #cbd5e1;
                        border: 1px solid #334155;
                    }
                    .btn-secondary:hover {
                        background: #334155;
                        color: #fff;
                    }
                    .engines-box {
                        background: rgba(139, 92, 246, 0.08);
                        border: 1px solid rgba(139, 92, 246, 0.2);
                        border-radius: 16px;
                        padding: 16px;
                        margin-top: 16px;
                    }
                    .engine-tag {
                        display: inline-block;
                        background: rgba(139, 92, 246, 0.2);
                        color: #c4b5fd;
                        border: 1px solid rgba(139, 92, 246, 0.4);
                        padding: 4px 10px;
                        border-radius: 8px;
                        font-size: 12px;
                        font-weight: 600;
                        margin-right: 8px;
                        margin-top: 6px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo-wrap">
                            <div class="logo">&lt;/&gt;</div>
                            <div>
                                <h1>DevPilot Backend API</h1>
                                <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
                                    Spring Boot 3.3.4 • Static Analysis & Remediation Platform
                                </div>
                            </div>
                        </div>
                        <div class="badge-online">
                            <div class="pulse"></div>
                            ONLINE (Port 8080)
                        </div>
                    </div>

                    <div class="grid">
                        <div class="card">
                            <div class="card-title">Database</div>
                            <div class="card-value">H2 / PostgreSQL Compatible</div>
                        </div>
                        <div class="card">
                            <div class="card-title">GraphQL Endpoint</div>
                            <div class="card-value">POST /graphql</div>
                        </div>
                        <div class="card">
                            <div class="card-title">Analysis Pipeline</div>
                            <div class="card-value">Polyglot Multi-Engine</div>
                        </div>
                    </div>

                    <div class="engines-box">
                        <div style="font-size: 13px; font-weight: 700; color: #e2e8f0;">Integrated Static Analysis Engines:</div>
                        <div style="margin-top: 6px;">
                            <span class="engine-tag">✓ Checkstyle (Google Checks)</span>
                            <span class="engine-tag">✓ PMD (Code Smell & Security)</span>
                            <span class="engine-tag">✓ SpotBugs (Bytecode Defect Scanner)</span>
                            <span class="engine-tag">✓ ESLint (TypeScript & React)</span>
                        </div>
                    </div>

                    <div class="actions">
                        <a href="/graphiql" class="btn btn-primary">
                            ⚡ Open Interactive GraphQL Playground
                        </a>
                        <a href="http://localhost:3001" class="btn btn-secondary" target="_blank">
                            🚀 Open DevPilot Frontend (Port 3001)
                        </a>
                        <a href="/actuator/health" class="btn btn-secondary">
                            🩺 Health Check
                        </a>
                    </div>
                </div>
            </body>
            </html>
            """;
        return ResponseEntity.ok(html);
    }

    /**
     * Browser navigation to /graphql:
     * When accessed via browser GET request, redirect seamlessly to the Interactive GraphQL IDE
     * so users never see "HTTP ERROR 405 Method Not Allowed".
     */
    @GetMapping(value = "/graphql", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<?> handleBrowserGetGraphQL(
            @RequestHeader(value = HttpHeaders.ACCEPT, defaultValue = "") String acceptHeader) {
        if (acceptHeader.contains("text/html") || acceptHeader.contains("*/*")) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("/graphiql"))
                    .build();
        }
        return ResponseEntity.ok("""
            {"status":"DevPilot GraphQL API is active. Send POST requests with { query: '...' } to this endpoint."}
            """);
    }

    /**
     * Self-contained, robust Interactive GraphQL Playground at http://localhost:8080/graphiql
     * Does NOT depend on unpkg.com React bundles, preventing the "Loading..." blank screen freeze.
     */
    @GetMapping(value = "/graphiql", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getGraphiqlPlayground() {
        String playgroundHtml = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevPilot — Interactive GraphQL Playground</title>
                <style>
                    :root {
                        --bg: #0b0f19;
                        --card: #121829;
                        --border: #1e293b;
                        --primary: #8b5cf6;
                        --accent: #ec4899;
                        --text: #f8fafc;
                        --text-muted: #94a3b8;
                    }
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background: var(--bg);
                        color: var(--text);
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                    }
                    header {
                        height: 56px;
                        background: #0e1322;
                        border-bottom: 1px solid var(--border);
                        padding: 0 20px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .brand {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-weight: 800;
                        font-size: 16px;
                    }
                    .brand-badge {
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        color: #fff;
                        padding: 4px 8px;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 13px;
                    }
                    .controls {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    select, button {
                        padding: 8px 16px;
                        border-radius: 10px;
                        font-size: 13px;
                        font-weight: 600;
                        outline: none;
                    }
                    select {
                        background: #1a2236;
                        border: 1px solid var(--border);
                        color: #fff;
                        cursor: pointer;
                    }
                    .btn-run {
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        color: #fff;
                        border: none;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        transition: opacity 0.2s;
                    }
                    .btn-run:hover { opacity: 0.9; }
                    .btn-link {
                        background: transparent;
                        border: 1px solid var(--border);
                        color: #94a3b8;
                        cursor: pointer;
                        text-decoration: none;
                        font-size: 12px;
                        padding: 7px 12px;
                        border-radius: 8px;
                    }
                    .btn-link:hover { color: #fff; border-color: #475569; }
                    .main-pane {
                        flex: 1;
                        display: flex;
                        overflow: hidden;
                    }
                    .editor-pane, .output-pane {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                    }
                    .editor-pane {
                        border-right: 1px solid var(--border);
                    }
                    .pane-header {
                        padding: 10px 16px;
                        background: #0e1322;
                        border-bottom: 1px solid var(--border);
                        font-size: 12px;
                        font-weight: 700;
                        color: var(--text-muted);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    textarea {
                        flex: 1;
                        background: #0b0f19;
                        border: none;
                        color: #e2e8f0;
                        padding: 16px;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                        font-size: 13px;
                        line-height: 1.5;
                        resize: none;
                        outline: none;
                    }
                    pre {
                        flex: 1;
                        margin: 0;
                        padding: 16px;
                        background: #080c14;
                        color: #38bdf8;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                        font-size: 13px;
                        line-height: 1.5;
                        overflow: auto;
                        white-space: pre-wrap;
                    }
                    .status-pill {
                        font-size: 11px;
                        padding: 3px 8px;
                        border-radius: 6px;
                        font-weight: bold;
                    }
                    .status-success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
                    .status-error { background: rgba(239, 68, 68, 0.2); color: #f87171; }
                </style>
            </head>
            <body>
                <header>
                    <div class="brand">
                        <span class="brand-badge">&lt;/&gt;</span>
                        <span>DevPilot GraphQL Explorer</span>
                    </div>
                    <div class="controls">
                        <select id="presetQuery" onchange="loadPreset()">
                            <option value="scans">1. Get Repositories & Scans</option>
                            <option value="issues">2. Get Static Analysis Issues</option>
                            <option value="metrics">3. Get Quality Metrics</option>
                            <option value="startScan">4. Mutation: Start Real Static Scan</option>
                        </select>
                        <button class="btn-run" onclick="executeQuery()">
                            ▶ Run Query (Ctrl+Enter)
                        </button>
                        <a href="http://localhost:3001" class="btn-link" target="_blank">
                            Open DevPilot UI ↗
                        </a>
                    </div>
                </header>

                <div class="main-pane">
                    <div class="editor-pane">
                        <div class="pane-header">
                            <span>GRAPHQL QUERY / MUTATION</span>
                            <span style="font-size: 11px; color: #64748b;">POST /graphql</span>
                        </div>
                        <textarea id="queryEditor" spellcheck="false"></textarea>
                    </div>

                    <div class="output-pane">
                        <div class="pane-header">
                            <span>JSON RESPONSE</span>
                            <span id="responseStatus" class="status-pill status-success">Ready</span>
                        </div>
                        <pre id="queryOutput">// Click "Run Query" or press Ctrl+Enter to execute.</pre>
                    </div>
                </div>

                <script>
                    const PRESETS = {
                        scans: `query GetRepositoriesAndScans {
  repositories {
    id
    fullName
    defaultBranch
    scans {
      id
      branchName
      commitSha
      status
      qualityScore
      startedAt
    }
  }
}`,
                        issues: `query GetStaticAnalysisIssues {
  repositories {
    id
    fullName
    scans {
      id
      status
      qualityScore
      issues {
        id
        engine
        severity
        ruleId
        message
        filePath
        startLine
        status
      }
    }
  }
}`,
                        metrics: `query GetQualityMetrics {
  qualityMetrics(scanId: "9069907d-358f-4a1b-a87d-8a870e5f993a") {
    qualityScore
    grade
    maintainabilityScore
    cyclomaticComplexity
    criticalCount
    highCount
    mediumCount
    lowCount
    openIssuesCount
  }
}`,
                        startScan: `mutation StartRealStaticAnalysisScan {
  startScan(input: {
    repositoryId: "bd8f2564-cd45-4d64-aa15-1719da0df96b",
    branchName: "main",
    commitSha: "HEAD"
  }) {
    id
    status
    qualityScore
    engineReports {
      engine
      status
      findingsCount
      executionTimeMs
    }
  }
}`
                    };

                    const editor = document.getElementById('queryEditor');
                    const output = document.getElementById('queryOutput');
                    const statusBadge = document.getElementById('responseStatus');

                    function loadPreset() {
                        const key = document.getElementById('presetQuery').value;
                        editor.value = PRESETS[key] || PRESETS.scans;
                    }

                    async function executeQuery() {
                        const query = editor.value.trim();
                        if (!query) return;

                        statusBadge.className = 'status-pill';
                        statusBadge.style.background = 'rgba(139, 92, 246, 0.2)';
                        statusBadge.style.color = '#c4b5fd';
                        statusBadge.innerText = 'Executing...';

                        const startTime = performance.now();
                        try {
                            const res = await fetch('/graphql', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ query: query })
                            });

                            const duration = Math.round(performance.now() - startTime);
                            const json = await res.json();

                            output.innerText = JSON.stringify(json, null, 2);

                            if (res.ok && !json.errors) {
                                statusBadge.className = 'status-pill status-success';
                                statusBadge.innerText = '200 OK • ' + duration + 'ms';
                            } else {
                                statusBadge.className = 'status-pill status-error';
                                statusBadge.innerText = 'GraphQL Error • ' + duration + 'ms';
                            }
                        } catch (err) {
                            output.innerText = 'Network error: ' + err.message;
                            statusBadge.className = 'status-pill status-error';
                            statusBadge.innerText = 'Connection Failed';
                        }
                    }

                    // Keyboard shortcut: Ctrl+Enter or Cmd+Enter
                    document.addEventListener('keydown', (e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            executeQuery();
                        }
                    });

                    // Initialize with default preset
                    loadPreset();
                </script>
            </body>
            </html>
            """;
        return ResponseEntity.ok(playgroundHtml);
    }
}
