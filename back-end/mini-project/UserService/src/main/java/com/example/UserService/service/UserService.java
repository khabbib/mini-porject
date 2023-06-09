package com.example.UserService.service;

import com.example.UserService.util.Bcrypt;
import lombok.RequiredArgsConstructor;
import com.example.UserService.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.UserService.repository.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    public CompletableFuture<List<User>> getAllUsers() {
        return userRepository.getAllUsers();
    }
    public  CompletableFuture<User> getUserById(String id) throws ExecutionException, InterruptedException {
        return userRepository.getUserById(id);
    }
    public ResponseEntity<String> createUser(User user) {
        String hashedPassword = Bcrypt.hash(user.getPassword());
        user.setPassword(hashedPassword);
        ResponseEntity<String> response = userRepository.createUser(user);
        return response;
    }
    public ResponseEntity<String> deleteUser(String id) {
        return userRepository.deleteUser(id);
    }
    public ResponseEntity<String> updateUser(String id, User user) {
        return userRepository.updateUser(id, user);
    }
    public User checkUserExists(String email, String password) throws ExecutionException, InterruptedException {
        User user = userRepository.getUserByEmail(email);
        System.out.println("User från db: " + user);
        if (user != null) {
            if(Bcrypt.check(password, user.getPassword())) {
                return user;
            }
            return null;
        }
        return null;
    }

    public User getUserByEmail(String email) {

        System.out.println("GETING USER BY EMAIL BBY" + email);
        try {
            User user = userRepository.getUserByEmail(email);
            return user;
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
