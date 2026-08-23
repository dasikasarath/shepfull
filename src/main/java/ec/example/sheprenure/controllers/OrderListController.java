package ec.example.sheprenure.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import ec.example.sheprenure.Entity.*;
import ec.example.sheprenure.Services.*;

import java.util.*;

@RestController
public class OrderListController {

    @Autowired
    private OrderListService ols;

    @GetMapping("/admin/orderslist")
    public List<OrderList> getOrderslist() {
        return ols.getorder();
    }

    @GetMapping("/admin/orders/{id}")
    public OrderList getMethodName(@PathVariable long id) {
        return ols.getOrderwid(id);
    }

    @GetMapping("/admin/orders/{id}/items")
    public List<OrderItemList> getOrderItems(@PathVariable long id) {
        return ols.getOrderItemsByOrderId(id);
    }
}

