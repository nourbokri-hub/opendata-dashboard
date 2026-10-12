package com.polytch_intel.Projet_Federateur.controller;


import com.polytch_intel.Projet_Federateur.dto.AuthResponse;
import com.polytch_intel.Projet_Federateur.dto.LoginRequest;
import com.polytch_intel.Projet_Federateur.dto.ProfileUpdateRequest;
import com.polytch_intel.Projet_Federateur.dto.RegisterRequest;
import com.polytch_intel.Projet_Federateur.dto.UserResponse;
import com.polytch_intel.Projet_Federateur.entity.User;
import com.polytch_intel.Projet_Federateur.repository.UserRepository;
import com.polytch_intel.Projet_Federateur.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setName(request.name().trim());
            user.setEmail(request.email().trim().toLowerCase());
            user.setPassword(passwordEncoder.encode(request.password()));
            user.setRole("USER");
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(UserResponse.from(savedUser));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(409).body("Cette adresse email est déjà utilisée.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest credentials) {
        User user = userRepository.findByEmail(credentials.email().trim().toLowerCase()).orElse(null);
        if (user != null && passwordEncoder.matches(credentials.password(), user.getPassword())) {
            String token = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, UserResponse.from(user)));
        }
        return ResponseEntity.status(401).body("Email ou mot de passe incorrect.");
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal String email,
                                            @Valid @RequestBody ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        String normalizedEmail = request.email().trim().toLowerCase();
        if (!normalizedEmail.equals(user.getEmail())
                && userRepository.findByEmail(normalizedEmail).isPresent()) {
            return ResponseEntity.status(409).body("Cette adresse email est déjà utilisée.");
        }
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        try {
            User updatedUser = userRepository.save(user);
            String token = jwtUtils.generateToken(updatedUser.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, UserResponse.from(updatedUser)));
        } catch (DuplicateKeyException e) {
            return ResponseEntity.status(409).body("Cette adresse email est déjà utilisée.");
        }
    }
}