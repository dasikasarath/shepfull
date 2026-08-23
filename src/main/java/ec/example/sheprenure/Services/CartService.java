package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ec.example.sheprenure.dto.*;


import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import ec.example.sheprenure.Repository.*;
import ec.example.sheprenure.Entity.*;
import org.springframework.transaction.annotation.Transactional;
@Service  //auth completed//
public class CartService {

    @Autowired
    private UserRepository urepo;

    @Autowired
    private ProductRepository prepo;

    @Autowired
    private CartRepository crepo;

    @Autowired
    private CartItemRepository cirepo;

    @Transactional
    public String addcart(CartDto obj) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        int userid = (Integer) auth.getDetails();

        if (obj == null || obj.getItems() == null || obj.getItems().isEmpty()) {
            return "No items provided";
        }

        Optional<UserEntity> user = urepo.findById(userid);
        if (user.isEmpty()) {
            return "user doesnot exist";
        }

        Cart cart = crepo.findByUserid(userid).orElseGet(() -> {
            Cart c = new Cart();
            c.setUserid(userid);
            c.setTotalPrice(0);
            return crepo.save(c);
        });

        for (CartItemDto i : obj.getItems()) {
            Optional<ProductEntity> pobj = prepo.findById(i.getProductId());
            if (pobj.isEmpty()) {
                throw new RuntimeException("Product does not exist");
            }
            if (pobj.get().getStock() < i.getQuantity()) {
                throw new RuntimeException("Insufficient stock available");
            }

            Optional<CartItem> existingItem = cirepo.findByUseridAndProductId(userid, i.getProductId());
            if (existingItem.isEmpty()) {
                CartItem ci = new CartItem();
                ci.setCart(cart);
                ci.setUserid(userid);
                ci.setProductId(i.getProductId());
                ci.setPrice(pobj.get().getProductPrice());
                ci.setQuantity(i.getQuantity());
                ci.setSubtotal(pobj.get().getProductPrice() * i.getQuantity());
                cirepo.save(ci);
            } else {
                CartItem ci = existingItem.get();
                ci.setQuantity(ci.getQuantity() + i.getQuantity());
                ci.setSubtotal(ci.getSubtotal() + (i.getQuantity() * pobj.get().getProductPrice()));
                cirepo.save(ci);
            }
        }

        List<CartItem> items = cirepo.findByUserid(userid);
        int total = 0;
        for (CartItem item : items) {
            total += item.getSubtotal();
        }

        cart.setTotalPrice(total);
        crepo.save(cart);

        return "Successfully added to cart";
    }




    public Cart getEntireCart() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        int userid = (Integer) auth.getDetails();
        return crepo.findByUserid(userid).orElseGet(() -> {
            Cart emptyCart = new Cart();
            emptyCart.setUserid(userid);
            emptyCart.setTotalPrice(0);
            return emptyCart;
        });
    }

   public String rem(int pid){
     Authentication auth =SecurityContextHolder.getContext().getAuthentication();
    int userid=(Integer) auth.getDetails();
    CartItem obj=cirepo.findByUseridAndProductId(userid,pid).orElseThrow(()->new RuntimeException("unable to find product"));
    int costminus=obj.getSubtotal();
    cirepo.deleteById(obj.getCartitemid());

   

    Optional<Cart> oobj=crepo.findByUserid(userid);
    if(oobj.isPresent()){
        Cart kbn=oobj.get();
        kbn.setTotalPrice(kbn.getTotalPrice()-costminus);
        crepo.save(kbn);
        return "successfully removed from cart";
    }

    return "failed to remove";
   }
    

   @Transactional
   public String incre(incredecreDto input){
    int pid=input.getPid();
    int num=input.getQuantity();
    ProductEntity prod=prepo.findById(pid).orElseThrow(()->new RuntimeException("product not found"));
    if(prod.getStock()<num){return "unable stock";}

    Authentication auth=SecurityContextHolder.getContext().getAuthentication();
    int userid=(Integer) auth.getDetails();

    CartItem obj=cirepo.findByUseridAndProductId(userid, pid).orElseThrow(()->new RuntimeException("no previous cart found"));

    obj.setQuantity(obj.getQuantity()+num);
    obj.setSubtotal(obj.getSubtotal()+num*prod.getProductPrice());
    cirepo.save(obj);

    Optional<Cart> oobj=crepo.findByUserid(userid);
    if(oobj.isPresent()){
        oobj.get().setTotalPrice(oobj.get().getTotalPrice()+num*prod.getProductPrice());
        crepo.save(oobj.get());

        return "successfully incremented to cart";
    }
        return "failed to add";
   }


   @Transactional
public String decre(incredecreDto input){
    int pid=input.getPid();
    int quantity=input.getQuantity();

    if(quantity<0){return "provide positive values only";}

    Authentication auth=SecurityContextHolder.getContext().getAuthentication();
    int userid=(Integer) auth.getDetails();

    ProductEntity prod=prepo.findById(pid).orElseThrow(()->new RuntimeException("no product found"));

    CartItem cio=cirepo.findByUseridAndProductId(userid, pid).orElseThrow(()->new RuntimeException("no cart found"));
    cio.setQuantity(cio.getQuantity()-quantity);
    cio.setSubtotal(cio.getSubtotal()-quantity*prod.getProductPrice());
    cirepo.save(cio);

   Optional<Cart> kbn=crepo.findByUserid(userid);
   if(kbn.isPresent()){
    Cart oooob=kbn.get();
    oooob.setTotalPrice(oooob.getTotalPrice()-quantity*prod.getProductPrice());
    crepo.save(oooob);
    return "successfully decremented items from cart";


   }

   return "failed to decrement";
}






}
