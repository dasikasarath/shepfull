package ec.example.sheprenure.Repository;
import ec.example.sheprenure.Entity.*;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface CartRepository extends JpaRepository<Cart,Integer> {
Optional<Cart> findByUserid(int userid);

}
