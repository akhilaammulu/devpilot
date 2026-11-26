package com.devpilot.observability;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Distributed caching service backed by Redis in production
 * with automatic local TTL cache fallback when Redis is disabled.
 */
@Service
public class RedisCacheService {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheService.class);

    @Value("${devpilot.redis.enabled:false}")
    private boolean redisEnabled;

    private final StringRedisTemplate redisTemplate;
    private final Map<String, CacheEntry> localCache = new ConcurrentHashMap<>();

    private record CacheEntry(String value, long expiresAtMs) {}

    public RedisCacheService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void put(String key, String value, Duration ttl) {
        if (redisEnabled && redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, value, ttl);
                return;
            } catch (Exception e) {
                log.warn("Redis put failed ({}); falling back to local cache", e.getMessage());
            }
        }
        localCache.put(key, new CacheEntry(value, System.currentTimeMillis() + ttl.toMillis()));
    }

    public String get(String key) {
        if (redisEnabled && redisTemplate != null) {
            try {
                return redisTemplate.opsForValue().get(key);
            } catch (Exception e) {
                log.warn("Redis get failed ({}); falling back to local cache", e.getMessage());
            }
        }
        CacheEntry entry = localCache.get(key);
        if (entry == null) return null;
        if (System.currentTimeMillis() > entry.expiresAtMs()) {
            localCache.remove(key);
            return null;
        }
        return entry.value();
    }

    public void evict(String key) {
        if (redisEnabled && redisTemplate != null) {
            try {
                redisTemplate.delete(key);
            } catch (Exception ignored) {}
        }
        localCache.remove(key);
    }
}
