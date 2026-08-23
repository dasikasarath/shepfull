package ec.example.sheprenure.Repository;
import ec.example.sheprenure.Entity.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BlocklistRepository extends JpaRepository<Blocklist,Integer> {
    boolean existsByToken(String token);
    
}
