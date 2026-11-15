package com.devpilot.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Intercepts browser GET navigation to /graphql and redirects to /graphiql
 * so users navigating directly via Chrome address bar never see "HTTP ERROR 405".
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GraphQLBrowserRedirectFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        String accept = request.getHeader("Accept");

        if (("GET".equalsIgnoreCase(method)) && 
            ("/graphql".equals(uri) || "/graphql/".equals(uri)) &&
            (accept != null && (accept.contains("text/html") || accept.contains("*/*")) && request.getQueryString() == null)) {
            response.sendRedirect("/graphiql");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
