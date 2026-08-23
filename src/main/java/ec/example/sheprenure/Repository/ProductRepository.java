package ec.example.sheprenure.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import ec.example.sheprenure.Entity.ProductEntity;
import java.util.List;


public interface ProductRepository extends JpaRepository<ProductEntity,Integer> {
    List<ProductEntity> findByCategory(String category);
    List<ProductEntity> findByProductNameContainingIgnoreCase(String name);
}
