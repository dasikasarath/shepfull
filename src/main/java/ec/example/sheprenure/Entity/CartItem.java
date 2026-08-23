package ec.example.sheprenure.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class CartItem {

    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
   private int cartitemid;
   private int productId;
   private int userid;
   private int price;
   private int quantity;
   private int subtotal;

     @ManyToOne   //json ignore use cheste every timr cart chupinchadu//
    @JoinColumn(name = "cart_id")
    private Cart cart;
    

    
}
