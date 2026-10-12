package com.polytch_intel.Projet_Federateur.repository;

import com.polytch_intel.Projet_Federateur.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}
