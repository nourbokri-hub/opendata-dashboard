package com.polytch_intel.Projet_Federateur.config;

import com.polytch_intel.Projet_Federateur.entity.User;
import com.polytch_intel.Projet_Federateur.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository,
                                                PasswordEncoder passwordEncoder,
                                                org.springframework.core.env.Environment env) {
        return args -> {
            String email = env.getProperty("admin.email", "admin@opendata.tn");
            String name = env.getProperty("admin.name", "Administrateur");

            if (userRepository.findByEmail(email).isEmpty()) {
                User admin = new User();
                admin.setEmail(email);
                admin.setName(name);
                admin.setPassword(passwordEncoder.encode(env.getRequiredProperty("admin.password")));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }
        };
    }
}
