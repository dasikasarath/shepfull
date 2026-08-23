package ec.example.sheprenure.dto;

import lombok.Data;

@Data
public class CloudinaryResponse {
    private String public_Url;
    private String secure_Url;

  public  CloudinaryResponse(String public_Url,String secure_Url){
        this.public_Url=public_Url;
        this.secure_Url=secure_Url;
    }
    
}
