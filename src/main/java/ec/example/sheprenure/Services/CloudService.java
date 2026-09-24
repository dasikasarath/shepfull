package ec.example.sheprenure.Services;

import java.io.IOException;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import ec.example.sheprenure.dto.*;

@Service
public class CloudService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public CloudinaryResponse getUploadImage(MultipartFile file) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> res = cloudinary.uploader().upload(file.getBytes(), Collections.emptyMap());
        return new CloudinaryResponse(res.get("public_id").toString(), res.get("secure_url").toString());
    }

    public String getDeleteImage(String publicId) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> delres = cloudinary.uploader().destroy(publicId, Collections.emptyMap());
        return delres.get("result").toString();
    }
}
