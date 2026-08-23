package ec.example.sheprenure.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import ec.example.sheprenure.Entity.CartItem;
import ec.example.sheprenure.Entity.OrderList;
import java.util.*;

public interface OrderListRepository extends JpaRepository<OrderList,Long>{
   List<OrderList> findByUserid(int userid); 
}
