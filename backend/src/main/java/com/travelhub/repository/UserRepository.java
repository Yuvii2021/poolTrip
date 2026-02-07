package com.travelhub.repository;

import com.travelhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsById(Long id);
    boolean existsByPhone(String phone);
    List<User> findByIdIn(Set<Long> ids);
}
