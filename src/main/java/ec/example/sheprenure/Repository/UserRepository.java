package ec.example.sheprenure.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import ec.example.sheprenure.Entity.UserEntity;

import java.util.*;

public interface UserRepository extends JpaRepository<UserEntity,Integer>  {

    Optional<UserEntity> findByName(String name);
    
} 
