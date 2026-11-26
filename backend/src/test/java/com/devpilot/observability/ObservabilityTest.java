package com.devpilot.observability;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class ObservabilityTest {

    @Test
    void testRedisCacheServiceLocalFallback() {
        RedisCacheService cache = new RedisCacheService(null);
        cache.put("scan:latest", "score:95", Duration.ofSeconds(30));
        assertEquals("score:95", cache.get("scan:latest"));

        cache.evict("scan:latest");
        assertNull(cache.get("scan:latest"));
    }

    @Test
    void testCorrelationIdFilterGeneratesHeader() throws Exception {
        CorrelationIdFilter filter = new CorrelationIdFilter();
        MockHttpServletRequest req = new MockHttpServletRequest();
        MockHttpServletResponse res = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(req, res, chain);

        String corrId = res.getHeader(CorrelationIdFilter.HEADER_NAME);
        assertNotNull(corrId);
        assertFalse(corrId.isBlank());
    }
}
