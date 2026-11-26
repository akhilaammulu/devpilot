package com.devpilot.repository;

import com.devpilot.rag.CodeChunkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface CodeChunkRepository extends JpaRepository<CodeChunkEntity, UUID> {
    List<CodeChunkEntity> findByRepositoryId(UUID repositoryId);
    long countByRepositoryId(UUID repositoryId);

    @Modifying
    @Transactional
    void deleteByRepositoryId(UUID repositoryId);
}
