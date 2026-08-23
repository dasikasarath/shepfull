package ec.example.sheprenure.controllers;


import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import ec.example.sheprenure.Entity.ProductEntity;
import ec.example.sheprenure.Services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.*;
import ec.example.sheprenure.dto.*;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;






@RestController
public class productController {

    @Autowired
  private ProductService proser;

    @PostMapping(value = "/admin/addproduct", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductEntity addProduct(@RequestPart("product") ProductEntity data, @RequestPart("file") MultipartFile file) {
        return proser.getAdd(data, file);
    }

    @GetMapping("/user/getall")
    public List<ProductEntity> getall() {
        return proser.getAll();
    }

    @GetMapping("/user/products/{pid}")
    public ProductEntity getproduct(@PathVariable int pid) {
        return proser.getpid(pid);
    }

    @GetMapping("/user/category/{cateName}")
    public List<ProductEntity> getCategory(@PathVariable String cateName) {
        return proser.getCateg(cateName);
    }

    @DeleteMapping("/admin/deleteall")
    public String getDelete() {
        return proser.getDel();
    }
    

    //test completed need to test one  ore time//
    @DeleteMapping("/admin/delete/{pid}")
    public ProductEntity getdeletepid(@PathVariable int pid){
        return proser.getdelpid(pid);
    }


    
    @GetMapping("/admin/products")
    public List<ProductEntity> getAllp() {
        return proser.adminallp();
    }
    
    
    @GetMapping("/admin/product/{pid}")
    public ProductEntity getadminpid(@PathVariable int pid) {
        return proser.getadminpbid(pid);
    }
    


    //tested//
  @PatchMapping("/admin/updateproduct")
  public UpdateProductDto getUpdate(@RequestBody UpdateProductDto inputdata){
return proser.updatePro(inputdata);
  }


  @PatchMapping(value="/admin/updateimage/{pid}", consumes =MediaType.MULTIPART_FORM_DATA_VALUE)
  public String getUpdatePicture(@PathVariable int pid,@RequestPart("file") MultipartFile file){
    return proser.updatepic(pid,file);
  }



//need to improve this search//
  @GetMapping("/user/search")
  public List<ProductEntity> getSearch(@RequestParam String name) {
      return proser.getSearchp(name);
  }
  


}
