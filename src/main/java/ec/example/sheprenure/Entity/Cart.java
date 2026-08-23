package ec.example.sheprenure.Entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;

import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;
import jakarta.persistence.CascadeType;

@Entity
@Data
public class Cart {
   
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
   private int cartid;
   private int userid;

 //  @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL)
 //  private List<CartItem> items;
   private int totalPrice;

    
}
