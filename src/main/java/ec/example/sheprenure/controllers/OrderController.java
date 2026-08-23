package ec.example.sheprenure.controllers;

import org.springframework.web.bind.annotation.RestController;

import ec.example.sheprenure.Services.OrderService;
import ec.example.sheprenure.dto.OrdersDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import ec.example.sheprenure.Entity.*;




@RestController
public class OrderController {

    @Autowired
    private OrderService ordser;

    @PostMapping("/user/order")
    public String getOrder(@RequestBody OrdersDto obj) {
        return ordser.getPlaceOrder(obj);
    }

    // whole
    @GetMapping("/user/seeorders")
    public List<OrderList> getMethodName() {
        return ordser.seeorders();
    }
    
    //item wise orders//
    @GetMapping("/user/orderitems")
    public List<OrderItemList> getMe() {
        return ordser.orderitemss();
    }

    @PatchMapping("/user/orders/{orderId}/cancel")
    public String cancelUserOrder(@PathVariable long orderId) {
        return ordser.cancelOrder(orderId);
    }
}

