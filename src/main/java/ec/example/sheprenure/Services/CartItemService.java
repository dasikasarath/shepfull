package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.*;

import ec.example.sheprenure.Entity.CartItem;
import ec.example.sheprenure.Repository.CartItemRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
@Service
public class CartItemService {
    @Autowired
    private CartItemRepository cirepo;


     public List<CartItem> getEntireCartitem(){
         Authentication auth=SecurityContextHolder.getContext().getAuthentication();
        int userid=(Integer)auth.getDetails();
       List< CartItem> obj=cirepo.findByUserid(userid);
        return obj != null ? obj : Collections.emptyList();
    }
}
