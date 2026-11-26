package com.devpilot.repository;

import com.devpilot.events.ScanEventRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScanEventRepository extends JpaRepository<ScanEventRecord, UUID> {
    List<ScanEventRecord> findByScanIdOrderByCreatedAtAsc(UUID scanId);
    List<ScanEventRecord> findByStatusOrderByCreatedAtDesc(String status);
    List<ScanEventRecord> findTop50ByOrderByCreatedAtDesc();
}
