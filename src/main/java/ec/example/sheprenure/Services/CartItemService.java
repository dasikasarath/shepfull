package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

import ec.example.sheprenure.Entity.CartItem;
import ec.example.sheprenure.Repository.CartItemRepository;

@Service
public class CartItemService {
    @Autowired
    private CartItemRepository cirepo;

    @Autowired
    private AuthHelper authHelper;

    public List<CartItem> getEntireCartitem() {
        int userid = authHelper.getCurrentUserId();
        List<CartItem> obj = cirepo.findByUserid(userid);
        return obj != null ? obj : Collections.emptyList();
    }
}
