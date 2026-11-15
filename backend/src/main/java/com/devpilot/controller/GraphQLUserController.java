package com.devpilot.controller;

import com.devpilot.model.User;
import com.devpilot.repository.UserRepository;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class GraphQLUserController {

    private final UserRepository userRepository;

    public GraphQLUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @QueryMapping
    public User currentUser() {
        return userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User demoUser = new User("123525344", "akhilaammulu", "akhila@example.com", "https://github.com/akhilaammulu.png");
            return userRepository.save(demoUser);
        });
    }
}
