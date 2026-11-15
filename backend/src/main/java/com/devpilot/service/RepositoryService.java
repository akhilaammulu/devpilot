package com.devpilot.service;

import com.devpilot.model.Repository;
import com.devpilot.model.User;
import com.devpilot.repository.RepositoryRepository;
import com.devpilot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final UserRepository userRepository;

    public RepositoryService(RepositoryRepository repositoryRepository, UserRepository userRepository) {
        this.repositoryRepository = repositoryRepository;
        this.userRepository = userRepository;
    }

    public List<Repository> getAllRepositories() {
        return repositoryRepository.findAll();
    }

    public Optional<Repository> getRepositoryById(UUID id) {
        return repositoryRepository.findById(id);
    }

    @Transactional
    public Repository connectRepository(String githubRepoId, String fullName, String defaultBranch, boolean isPrivate, String htmlUrl) {
        return repositoryRepository.findByGithubRepoId(githubRepoId)
                .map(existing -> {
                    existing.setFullName(fullName);
                    existing.setDefaultBranch(defaultBranch);
                    existing.setPrivate(isPrivate);
                    existing.setHtmlUrl(htmlUrl);
                    return repositoryRepository.save(existing);
                })
                .orElseGet(() -> {
                    User defaultUser = userRepository.findAll().stream().findFirst().orElse(null);
                    Repository newRepo = new Repository(defaultUser, githubRepoId, fullName, defaultBranch, isPrivate, htmlUrl);
                    return repositoryRepository.save(newRepo);
                });
    }
}
