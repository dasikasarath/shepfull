package ec.example.sheprenure.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ec.example.sheprenure.Entity.*;
import java.util.*;

public interface OrderItemListRepository extends JpaRepository<OrderItemList, Integer> {
    List<OrderItemList> findByUserId(int userid);
    List<OrderItemList> findByOrderId(long orderId);
}

