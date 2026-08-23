package ec.example.sheprenure.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

import ec.example.sheprenure.Services.CartService;
import ec.example.sheprenure.dto.*;
import ec.example.sheprenure.Entity.*;
import java.util.*;
import ec.example.sheprenure.Services.*;

@RestController
public class CartController {

    @Autowired
    private CartService cartser;

    @Autowired
    private CartItemService cartitemser;

    @PostMapping("/user/addtocart")
    public String cart(@RequestBody CartDto obj) {
        return cartser.addcart(obj);
    }

    @GetMapping("/user/cartdb")
    public Cart getAllCart() {
        return cartser.getEntireCart();
    }

    @GetMapping("/user/cartitemdb")
    public List<CartItem> getAllCartitem() {
        return cartitemser.getEntireCartitem();
    }

    @DeleteMapping("/user/remcart/{pid}")
    public String remove(@PathVariable int pid) {
        return cartser.rem(pid);
    }

    @PatchMapping("/user/incrementcart")
    public String increCart(@RequestBody incredecreDto input) {
        return cartser.incre(input);
    }

    @PatchMapping("/user/decrementcart")
    public String decreCart(@RequestBody incredecreDto input) {
        return cartser.decre(input);
    }
}
