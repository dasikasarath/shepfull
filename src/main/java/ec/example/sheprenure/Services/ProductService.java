package ec.example.sheprenure.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import ec.example.sheprenure.Entity.ProductEntity;
import ec.example.sheprenure.Repository.ProductRepository;
import ec.example.sheprenure.dto.CloudinaryResponse;
import ec.example.sheprenure.dto.UpdateProductDto;
import jakarta.transaction.Transactional;

import java.util.*;

@Service
public class ProductService {

    @Autowired
  private ProductRepository prepo;

    @Autowired
    private CloudService cloudservice;

    @Transactional
    public ProductEntity getAdd(ProductEntity data,MultipartFile file){
             try{
             CloudinaryResponse resp=cloudservice.getUploadImage(file);
             String surl=resp.getSecure_Url();
             String purl=resp.getPublic_Url();
             data.setSecure_Url(surl);
             data.setPublic_Url(purl);
             prepo.save(data);
             }catch(Exception e){
                e.printStackTrace();
                throw new RuntimeException("unable to upload",e);
             }

            return data;
        
    }


    public List<ProductEntity> getAll(){
        return prepo.findAll();
    }
    


    public List<ProductEntity> getCateg(String cateName){

        List<ProductEntity> dblis=prepo.findByCategory(cateName);
        if(!dblis.isEmpty()){
            return dblis;
        }

        return Collections.emptyList();

    }



    public String getDel(){
        prepo.deleteAll();
        return "deleted successfully!";
    }

    public ProductEntity getpid(int pid){
        ProductEntity pro=prepo.findById(pid).orElseThrow(()->new RuntimeException("unable to find"));
    
            return pro;
        
    
    }



    public ProductEntity getdelpid(int pid){
        try{
            
        ProductEntity pobj=prepo.findById(pid).orElseThrow(()->new RuntimeException("invalid product"));
        String dres=cloudservice.getDeleteImage(pobj.getPublic_Url());
        prepo.deleteById(pobj.getProductId());
        return pobj;}
        catch(Exception e){
            throw new RuntimeException("failed to delete"+e.getMessage());
        }
    }


    public List<ProductEntity> adminallp(){
        List<ProductEntity> prolis=prepo.findAll();
        return prolis;
    }
   

public ProductEntity getadminpbid(int pid){
    ProductEntity pobj=prepo.findById(pid).orElseThrow(()-> new RuntimeException("unable to find product"));
    return pobj;
}

public UpdateProductDto updatePro(UpdateProductDto inputdata)
{
    ProductEntity dbobj=prepo.findById(inputdata.getProductId()).orElseThrow(()->new RuntimeException("product with that id not found"));
    if(inputdata.getProductDes()!=null && !inputdata.getProductDes().isBlank()){
        dbobj.setProductDes(inputdata.getProductDes());
    }
    if(inputdata.getStock()!=null && inputdata.getStock()>=0){
        dbobj.setStock(dbobj.getStock()+inputdata.getStock());
    }
    if(inputdata.getProductPrice()!=null && inputdata.getProductPrice()>0){
        dbobj.setProductPrice(inputdata.getProductPrice());
    }

    prepo.save(dbobj);

    return inputdata;


}

public List<ProductEntity> getSearchp(String name){
   List<ProductEntity> listofp=prepo.findByProductNameContainingIgnoreCase(name); 
   if(listofp.isEmpty()){
    return Collections.emptyList();
   }

   return listofp;
}


public String updatepic(int pid,MultipartFile file){
    ProductEntity data=prepo.findById(pid).orElseThrow(()-> new RuntimeException("unable to find product"));
    try{
        CloudinaryResponse resp=cloudservice.getUploadImage(file);
        String oldpid=data.getPublic_Url();
        String oldse=data.getSecure_Url(); //present no use//
        data.setPublic_Url(resp.getPublic_Url());
        data.setSecure_Url(resp.getSecure_Url());
        prepo.save(data);

        cloudservice.getDeleteImage(oldpid);

        return "successfully updated product picture";

    }catch(Exception e){
        throw new RuntimeException("failed to update"+e.getStackTrace());
    }

}





}
