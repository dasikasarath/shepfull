package ec.example.sheprenure.Entity;


import java.time.LocalDateTime;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import jakarta.persistence.Entity;



    
@Entity

public class OrderList {

    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY )
    private long orderId;
    private int userid;
    private int totalPrice;
    private String status;
    private String mobile;
    public long getOrderId() {
        return orderId;
    }
    public void setOrderId(long orderId) {
        this.orderId = orderId;
    }
    public int getUserid() {
        return userid;
    }
    public void setUserid(int userid) {
        this.userid = userid;
    }
    public int getTotalPrice() {
        return totalPrice;
    }
    public void setTotalPrice(int totalPrice) {
        this.totalPrice = totalPrice;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public String getMobile() {
        return mobile;
    }
    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
    public String getShippingAdd() {
        return shippingAdd;
    }
    public void setShippingAdd(String shippingAdd) {
        this.shippingAdd = shippingAdd;
    }
    public LocalDateTime getDelivery() {
        return delivery;
    }
    public void setDelivery(LocalDateTime delivery) {
        this.delivery = delivery;
    }
    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }
    public void setOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }
    private String shippingAdd;
    private LocalDateTime delivery;
    private LocalDateTime orderedAt;

   
}