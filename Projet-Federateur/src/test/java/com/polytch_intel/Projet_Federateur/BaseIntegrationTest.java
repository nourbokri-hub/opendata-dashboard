package com.polytch_intel.Projet_Federateur;

import com.polytch_intel.Projet_Federateur.entity.User;
import com.polytch_intel.Projet_Federateur.repository.DatasetRepository;
import com.polytch_intel.Projet_Federateur.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired protected MockMvc mockMvc;

    @Autowired protected UserRepository userRepository;
    @Autowired protected DatasetRepository datasetRepository;
    @Autowired protected PasswordEncoder passwordEncoder;

    protected final String ADMIN_EMAIL = "admin@opendata.tn";
    protected final String ADMIN_PASSWORD = "Admin@123";

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
        datasetRepository.deleteAll();

        User admin = new User();
        admin.setEmail(ADMIN_EMAIL);
        admin.setName("Administrateur");
        admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole("ADMIN");
        userRepository.save(admin);
    }
}
