package com.devpilot.events;

import com.devpilot.repository.ScanEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * Event-Driven Messaging Bus (Phase 8).
 * Publishes domain events to Apache Kafka when enabled and processes async workers
 * with retry + Dead-Letter Queue (DLQ) persistence and Prometheus metrics.
 */
@Service
public class EventBusService {

    private static final Logger log = LoggerFactory.getLogger(EventBusService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final int MAX_RETRIES = 3;

    @Value("${devpilot.kafka.enabled:false}")
    private boolean kafkaEnabled;

    private final ScanEventRepository eventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final MeterRegistry meterRegistry;
    private final ExecutorService workerPool = Executors.newFixedThreadPool(4);

    @Autowired
    public EventBusService(ScanEventRepository eventRepository,
                           @Autowired(required = false) KafkaTemplate<String, String> kafkaTemplate,
                           @Autowired(required = false) MeterRegistry meterRegistry) {
        this.eventRepository = eventRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.meterRegistry = meterRegistry;
    }

    public ScanEventRecord publish(UUID scanId,
                                   UUID repositoryId,
                                   ScanEventType eventType,
                                   Map<String, Object> payload) {
        String correlationId = MDC.get("correlationId");
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().substring(0, 12);
        }

        ScanEventRecord record = new ScanEventRecord();
        record.setScanId(scanId);
        record.setRepositoryId(repositoryId);
        record.setEventType(eventType);
        record.setCorrelationId(correlationId);
        record.setStatus("PUBLISHED");

        String json = "{}";
        try {
            json = MAPPER.writeValueAsString(payload != null ? payload : Map.of());
        } catch (Exception ignored) {}
        record.setPayloadJson(json);

        ScanEventRecord saved = eventRepository.save(record);

        if (meterRegistry != null) {
            meterRegistry.counter("devpilot.events.published", "type", eventType.name()).increment();
        }

        if (kafkaEnabled && kafkaTemplate != null) {
            try {
                kafkaTemplate.send("devpilot." + eventType.name().toLowerCase(), scanId.toString(), json);
                log.info("Published {} to Kafka topic devpilot.{} (scanId={})", eventType, eventType.name().toLowerCase(), scanId);
            } catch (Exception e) {
                log.warn("Kafka send failed for {} ({}); continuing with local worker", eventType, e.getMessage());
            }
        }

        return saved;
    }

    public void executeWithRetryAndDlq(ScanEventRecord eventRecord, Consumer<ScanEventRecord> handler) {
        workerPool.submit(() -> {
            MDC.put("correlationId", eventRecord.getCorrelationId());
            try {
                int attempts = 0;
                while (attempts < MAX_RETRIES) {
                    try {
                        attempts++;
                        handler.accept(eventRecord);
                        eventRecord.setStatus("PROCESSED");
                        eventRecord.setProcessedAt(Instant.now());
                        eventRepository.save(eventRecord);
                        return;
                    } catch (Exception ex) {
                        eventRecord.setRetryCount(attempts);
                        eventRecord.setErrorMessage(ex.getMessage());
                        if (attempts < MAX_RETRIES) {
                            eventRecord.setStatus("RETRYING");
                            eventRepository.save(eventRecord);
                            log.warn("Worker retry {}/{} for event {} ({}): {}",
                                    attempts, MAX_RETRIES, eventRecord.getEventType(), eventRecord.getId(), ex.getMessage());
                            try { Thread.sleep(250L * attempts); } catch (InterruptedException ignored) {}
                        } else {
                            eventRecord.setStatus("DEAD_LETTER");
                            eventRepository.save(eventRecord);
                            if (meterRegistry != null) {
                                meterRegistry.counter("devpilot.events.dlq", "type", eventRecord.getEventType().name()).increment();
                            }
                            log.error("Event {} moved to DEAD_LETTER after {} attempts: {}",
                                    eventRecord.getId(), MAX_RETRIES, ex.getMessage());
                        }
                    }
                }
            } finally {
                MDC.remove("correlationId");
            }
        });
    }

    public List<ScanEventRecord> getEventsForScan(UUID scanId) {
        if (scanId != null) {
            return eventRepository.findByScanIdOrderByCreatedAtAsc(scanId);
        }
        return eventRepository.findTop50ByOrderByCreatedAtDesc();
    }

    public List<ScanEventRecord> getDeadLetterEvents() {
        return eventRepository.findByStatusOrderByCreatedAtDesc("DEAD_LETTER");
    }

    public ScanEventRecord markDeadLetterRetried(UUID eventId) {
        ScanEventRecord rec = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        rec.setStatus("PROCESSED");
        rec.setRetryCount(rec.getRetryCount() + 1);
        rec.setProcessedAt(Instant.now());
        return eventRepository.save(rec);
    }
}
