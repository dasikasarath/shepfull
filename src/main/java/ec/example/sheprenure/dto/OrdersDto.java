package ec.example.sheprenure.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OrdersDto {
    @JsonProperty("orders")
    private List<ProductsDto> orders;
}

