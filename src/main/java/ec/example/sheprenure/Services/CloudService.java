package ec.example.sheprenure.Services;

import java.io.IOException;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.utils.ObjectUtils;

import ec.example.sheprenure.cloudinaryConfig;
import ec.example.sheprenure.dto.*;

@Service
public class CloudService {

    
    private cloudinaryConfig cloudinary;

    CloudService(cloudinaryConfig cloudinary){
        this.cloudinary=cloudinary;
    }

   public CloudinaryResponse getUploadImage(MultipartFile file) throws IOException{

    Map<String,Object> res=cloudinary.cloudinary().uploader().upload(file.getBytes(), Collections.emptyMap());

    System.out.println(res);

    return new CloudinaryResponse(res.get("public_id").toString(),res.get("secure_url").toString());

   }
   
   

   public String getDeleteImage(String publicId) throws IOException{
    Map<String,Object> delres=cloudinary.cloudinary().uploader().destroy(publicId, Collections.emptyMap());

    return delres.get("result").toString();

   }
    
}
