package ec.example.sheprenure.dto;
import ec.example.sheprenure.Entity.*;
import lombok.Data;
import java.util.*;

@Data
public class OrderListDto {

    private int userid;
    private List<ProductsDto> orders;
    
}
