package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import ec.example.sheprenure.Entity.*;
import ec.example.sheprenure.Repository.OrderItemListRepository;
import ec.example.sheprenure.Repository.OrderListRepository;

@Service
public class OrderListService {

    @Autowired
    private OrderListRepository olr;

    @Autowired
    private OrderItemListRepository orderitemrepo;

    public List<OrderList> getorder() {
        return olr.findAll();
    }

    public OrderList getOrderwid(long id) {
        return olr.findById(id).orElseThrow(() -> new RuntimeException("Order with this id not found"));
    }

    public List<OrderItemList> getOrderItemsByOrderId(long orderId) {
        List<OrderItemList> items = orderitemrepo.findByOrderId(orderId);
        return items != null ? items : Collections.emptyList();
    }
}

