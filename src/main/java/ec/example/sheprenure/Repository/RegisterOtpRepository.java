package ec.example.sheprenure.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ec.example.sheprenure.Entity.RegisterOtp;

@Repository
public interface RegisterOtpRepository extends JpaRepository<RegisterOtp, Integer> {
    Optional<RegisterOtp> findByEmail(String email);
    void deleteByEmail(String email);
}
