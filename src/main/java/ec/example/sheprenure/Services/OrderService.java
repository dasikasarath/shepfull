package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ec.example.sheprenure.dto.*;
import ec.example.sheprenure.Repository.*;
import ec.example.sheprenure.Entity.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;
@Service  //auth complted//
public class OrderService {


    @Autowired
    private OrderItemListRepository orderitemrepo;

    @Autowired
    private OrderListRepository orderlistrepo;

    @Autowired
    private UserRepository userrepo;

    @Autowired
    private ProductRepository prorepo;

    

    public String getPlaceOrder(OrdersDto obj){

         Authentication auth=SecurityContextHolder.getContext().getAuthentication();
        int userid=(Integer)auth.getDetails();

        Optional<UserEntity> db=userrepo.findById(userid);
        if(db.isEmpty()){
            return "user id doesnot exist";
        }
             OrderList oobj=new OrderList();

                oobj.setUserid(userid);
             oobj.setDelivery(LocalDateTime.now().plusDays(7));
            oobj.setOrderedAt(LocalDateTime.now());
            oobj.setStatus("placed");
            oobj.setShippingAdd(db.get().getShippingAdd());
            oobj.setMobile(db.get().getMobile());

            
            OrderList savedobj=orderlistrepo.save(oobj);

            int totalamount=0;
            for(ProductsDto o: obj.getOrders()){
              OrderItemList oil=new OrderItemList();
              ProductEntity dbob=prorepo.findById(o.getProductId()).orElse(null);
              if(dbob==null){
                return "product doesnot exist";
               }
            if(o.getQuantity()>dbob.getStock()){
                return "insufficient stock";

            }

            oil.setUserId(String.valueOf(userid));
            oil.setProductId(String.valueOf(dbob.getProductId()));
            oil.setQuantity(o.getQuantity());
            oil.setSubTotal(dbob.getProductPrice()*o.getQuantity());
            oil.setOrderId(savedobj.getOrderId());
            oil.setProductPrice(dbob.getProductPrice());
            

            totalamount=totalamount+(dbob.getProductPrice()*o.getQuantity());
            dbob.setStock(dbob.getStock()-o.getQuantity());

            prorepo.save(dbob);
            orderitemrepo.save(oil);



            }
            savedobj.setTotalPrice(totalamount);
            orderlistrepo.save(savedobj);

            


            

            return "order placed successfully";

            
        
        
    }


    public List<OrderList> seeorders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        int userid = (Integer) auth.getDetails();
        List<OrderList> obj = orderlistrepo.findByUserid(userid);
        return obj != null ? obj : Collections.emptyList();
    }

    public List<OrderItemList> orderitemss() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        int userid = (Integer) auth.getDetails();
        List<OrderItemList> obj = orderitemrepo.findByUserId(userid);
        return obj != null ? obj : Collections.emptyList();
    }

    @org.springframework.transaction.annotation.Transactional
    public String cancelOrder(long orderId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        int userid = (Integer) auth.getDetails();

        OrderList order = orderlistrepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (order.getUserid() != userid) {
            throw new RuntimeException("Unauthorized: You cannot cancel someone else's order");
        }

        if ("cancelled".equalsIgnoreCase(order.getStatus())) {
            return "Order is already cancelled";
        }

        if ("delivered".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Cannot cancel a delivered order");
        }

        // Restore stock for all items belonging to this order
        List<OrderItemList> items = orderitemrepo.findByOrderId(orderId);
        for (OrderItemList item : items) {
            try {
                int pid = Integer.parseInt(item.getProductId());
                Optional<ProductEntity> prod = prorepo.findById(pid);
                if (prod.isPresent()) {
                    ProductEntity p = prod.get();
                    p.setStock(p.getStock() + item.getQuantity());
                    prorepo.save(p);
                }
            } catch (Exception e) {
                // Ignore parsing errors if any
            }
        }

        order.setStatus("cancelled");
        orderlistrepo.save(order);

        return "Order #" + orderId + " cancelled successfully";
    }
}

