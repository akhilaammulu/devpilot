package com.devpilot.events;

import com.devpilot.repository.ScanEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EventBusServiceTest {

    private ScanEventRepository eventRepo;
    private EventBusService eventBus;

    @BeforeEach
    void setUp() {
        eventRepo = mock(ScanEventRepository.class);
        when(eventRepo.save(any(ScanEventRecord.class))).thenAnswer(inv -> {
            ScanEventRecord r = inv.getArgument(0);
            if (r.getId() == null) r.setId(UUID.randomUUID());
            return r;
        });
        eventBus = new EventBusService(eventRepo, null, null);
    }

    @Test
    void testPublishScanRequestedEvent() {
        UUID scanId = UUID.randomUUID();
        UUID repoId = UUID.randomUUID();

        ScanEventRecord rec = eventBus.publish(
                scanId, repoId, ScanEventType.SCAN_REQUESTED, Map.of("branch", "main")
        );

        assertNotNull(rec);
        assertEquals(ScanEventType.SCAN_REQUESTED, rec.getEventType());
        assertEquals("PUBLISHED", rec.getStatus());
        assertNotNull(rec.getCorrelationId());
        assertTrue(rec.getPayloadJson().contains("main"));
    }

    @Test
    void testRetryMovesFailedWorkerToDeadLetterAfterMaxRetries() throws Exception {
        UUID scanId = UUID.randomUUID();
        UUID repoId = UUID.randomUUID();
        ScanEventRecord rec = eventBus.publish(scanId, repoId, ScanEventType.SCAN_REQUESTED, Map.of());

        eventBus.executeWithRetryAndDlq(rec, r -> {
            throw new RuntimeException("Simulated worker failure");
        });

        // Wait briefly for async retries (250ms + 500ms + execution)
        Thread.sleep(1400);

        assertEquals("DEAD_LETTER", rec.getStatus());
        assertEquals(3, rec.getRetryCount());
        assertEquals("Simulated worker failure", rec.getErrorMessage());
    }
}
