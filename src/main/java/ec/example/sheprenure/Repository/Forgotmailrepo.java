package ec.example.sheprenure.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import ec.example.sheprenure.Entity.Forgotpassword;
import java.util.*;
import ec.example.sheprenure.Entity.*;

public interface Forgotmailrepo extends JpaRepository<Forgotpassword,Integer> {
    
    

    void deleteByName(String name);

    Optional<Forgotpassword> findByName(String name);

    
}
