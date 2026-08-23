package ec.example.sheprenure.dto;

import lombok.Data;

@Data
public class UpdateProductDto {
    private int productId;
    private String productDes;
    private Integer stock;
    private Integer productPrice;
    
}
