package com.polytch_intel.Projet_Federateur.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.polytch_intel.Projet_Federateur.dto.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class DatasetRequestSizeFilter extends OncePerRequestFilter {
    private static final int MAX_REQUEST_BYTES = 25 * 1024 * 1024;
    private final ObjectMapper objectMapper;

    public DatasetRequestSizeFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        boolean datasetWrite = "POST".equals(request.getMethod())
                && "/api/datasets/upload".equals(path)
                || "PUT".equals(request.getMethod())
                && path.matches("/api/datasets/[^/]+");
        String contentType = request.getContentType();
        boolean json = false;
        if (contentType != null) {
            try {
                json = MediaType.APPLICATION_JSON.isCompatibleWith(MediaType.parseMediaType(contentType));
            } catch (IllegalArgumentException ignored) {
                return true;
            }
        }
        return !datasetWrite || !json;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (request.getContentLengthLong() > MAX_REQUEST_BYTES) {
            rejectOversizedRequest(response);
            return;
        }

        byte[] body = request.getInputStream().readNBytes(MAX_REQUEST_BYTES + 1);
        if (body.length > MAX_REQUEST_BYTES) {
            rejectOversizedRequest(response);
            return;
        }
        filterChain.doFilter(new BufferedBodyRequest(request, body), response);
    }

    private void rejectOversizedRequest(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
                response.getOutputStream(),
                ApiErrorResponse.of(
                        HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE,
                        "PAYLOAD_TOO_LARGE",
                        "La requête dépasse la limite autorisée de 25 Mio."
                )
        );
    }

    private static final class BufferedBodyRequest extends HttpServletRequestWrapper {
        private final ServletInputStream input;

        private BufferedBodyRequest(HttpServletRequest request, byte[] body) {
            super(request);
            ByteArrayInputStream buffer = new ByteArrayInputStream(body);
            this.input = new ServletInputStream() {
                @Override
                public int read() {
                    return buffer.read();
                }

                @Override
                public boolean isFinished() {
                    return buffer.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(jakarta.servlet.ReadListener readListener) {
                    throw new UnsupportedOperationException("Asynchronous request reads are not supported.");
                }
            };
        }

        @Override
        public ServletInputStream getInputStream() {
            return input;
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }
    }
}
