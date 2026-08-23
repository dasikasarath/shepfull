package ec.example.sheprenure;

import java.util.*;
import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class cloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudname;

    @Value("${cloudinary.api-key}")
    private String apikey;


    @Value("${cloudinary.api-secret}")
    private String secretapi;

@Bean
public Cloudinary cloudinary(){
Map<String,String> config=new HashMap<>();
config.put("cloud_name",cloudname);
config.put("api_key",apikey);
config.put("api_secret",secretapi);

return new Cloudinary(config);
}

}
