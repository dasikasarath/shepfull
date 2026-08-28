package ec.example.sheprenure.Repository;

import java.util.*;
import ec.example.sheprenure.Entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface CartItemRepository extends JpaRepository<CartItem,Integer> {

    Optional<CartItem> findByProductId(int proid);
    Optional<CartItem> findByUseridAndProductId(int userid,int productid);

    List<CartItem> findByUserid(int userid);
    void deleteByUserid(int userid);
    
}
