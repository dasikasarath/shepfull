package ec.example.sheprenure.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
public class UserEntity {



    //variables
    @Id
    @GeneratedValue(strategy =GenerationType.IDENTITY )

    private int userId;
    private String name;
    @NotBlank
    @Email
    private String email;
    private String password;
    private String pincode;
    private String mobile;
    private String shippingAdd;
    private String role;
    private Boolean isVerified = false;

 /*    //constructors(7-saltilu)
    public UserEntity(){

    }

    //getters
    public int getUserid(){return userid;}
    public String getName(){return name;}
    public String getEmail(){return email;}
    public String getShippingAdd(){return shippingAdd;}
    public String getPassword(){return password;}
    public String getPincode(){return pincode;}
    public String getMobile(){return mobile;}


    //setters
    public void setUserid(int user_id){this.userid=userid;}
    public void setName(String name){this.name=name;}
    public void setEmail(String email){this.email=email;}
    public void setShippingAdd(String shippingAdd){this.shippingAdd=shippingAdd;}
    public void setPassword(String password){this.password=password;}
    public void setPincode(String pincode){this.pincode=pincode;}
    public void setMobile(String mobile){this.mobile=mobile;}
    */
}
