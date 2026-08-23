package ec.example.sheprenure.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ProductEntity {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @JsonProperty("productId")
    private int ProductId;

    @JsonProperty("productName")
    private String productName;

    @JsonProperty("productDes")
    private String ProductDes;

    @JsonProperty("productPrice")
    private int ProductPrice;

    @JsonProperty("stock")
    private int Stock;

    @JsonProperty("category")
    private String category;

    @JsonProperty("public_Url")
    private String public_Url;

    @JsonProperty("secure_Url")
    private String secure_Url;

    public ProductEntity() {}

    public int getProductId() { return ProductId; }
    public String getProductName() { return productName; }
    public String getProductDes() { return ProductDes; }
    public int getProductPrice() { return ProductPrice; }
    public int getStock() { return Stock; }
    public String getCategory() { return category; }
    public String getPublic_Url() { return public_Url; }
    public String getSecure_Url() { return secure_Url; }

    public void setProductId(int ProductId) { this.ProductId = ProductId; }
    public void setProductName(String productName) { this.productName = productName; }
    public void setProductDes(String ProductDes) { this.ProductDes = ProductDes; }
    public void setProductPrice(int ProductPrice) { this.ProductPrice = ProductPrice; }
    public void setStock(int Stock) { this.Stock = Stock; }
    public void setCategory(String category) { this.category = category; }
    public void setPublic_Url(String public_Url) { this.public_Url = public_Url; }
    public void setSecure_Url(String secure_Url) { this.secure_Url = secure_Url; }
}

