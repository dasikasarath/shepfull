package ec.example.sheprenure.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;


@Entity
@Data
public class OrderItemList {

    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY)
    private int id;
    private long orderId;
    private String userId;
    private String productId;
    private int subTotal;
    private int quantity;
    private int productPrice;
    private LocalDateTime orderedAt;


 /*    public OrderItemList(){
        
    }

    public String getProductId(){return productId;}
    public int getId(){return id;}
    public long getOrderId(){return orderId;}
    public String getUserId(){return userId;}
    public int getSubTotal(){return subTotal;}
    public int getQuantity(){return quantity;}
    public int getProductPrice(){return productPrice;}
    public LocalDateTime getOrderedAt(){return orderedAt;}

    public void setProductId(String productId){this.productId=productId;}
    public void setId(int id){this.id=id;}
    public void setOrderId(long orderId){this.orderId=orderId;}
    public void setUserId(String userId){this.userId=userId;}
    public void setSubTotal(int subTotal){this.subTotal=subTotal;}
    public void setQuantity(int quantity){this.quantity=quantity;}
    public void setProductPrice(int productPrice){this.productPrice=productPrice;}
    public void setOrderedAt(LocalDateTime orderedAt){this.orderedAt=orderedAt;}
    */
}
