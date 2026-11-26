package com.devpilot.controller;

import com.devpilot.events.AsyncScanWorkers;
import com.devpilot.events.EventBusService;
import com.devpilot.events.ScanEventRecord;
import com.devpilot.model.RepositoryScan;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class GraphQLEventsController {

    private final AsyncScanWorkers asyncScanWorkers;
    private final EventBusService eventBusService;

    public GraphQLEventsController(AsyncScanWorkers asyncScanWorkers, EventBusService eventBusService) {
        this.asyncScanWorkers = asyncScanWorkers;
        this.eventBusService = eventBusService;
    }

    @MutationMapping
    public RepositoryScan startAsyncScan(@Argument Map<String, Object> input) {
        UUID repositoryId = UUID.fromString(String.valueOf(input.get("repositoryId")));
        String branchName = String.valueOf(input.getOrDefault("branchName", "main"));
        String commitSha = String.valueOf(input.getOrDefault("commitSha", "HEAD"));
        return asyncScanWorkers.startAsyncScan(repositoryId, branchName, commitSha);
    }

    @QueryMapping
    public List<ScanEventRecord> scanEvents(@Argument UUID scanId) {
        return eventBusService.getEventsForScan(scanId);
    }

    @QueryMapping
    public List<ScanEventRecord> deadLetterEvents() {
        return eventBusService.getDeadLetterEvents();
    }

    @MutationMapping
    public ScanEventRecord retryDeadLetterEvent(@Argument UUID eventId) {
        return eventBusService.markDeadLetterRetried(eventId);
    }
}
