package ec.example.sheprenure.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CartItemDto {
    @JsonProperty("productId")
    private int productId;

    @JsonProperty("quantity")
    private int quantity;
}

