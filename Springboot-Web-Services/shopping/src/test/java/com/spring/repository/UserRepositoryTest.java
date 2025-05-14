package com.spring.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ContextConfiguration;

import com.example.demo.ShoppingApplication;
import com.spring.exception.UserCustomException;
import com.spring.model.User;

@DataJpaTest
@ContextConfiguration(classes = ShoppingApplication.class)
@AutoConfigureTestDatabase(replace = Replace.NONE)
class UserRepositoryTest {

	@Autowired
	UserRepository userRepository;

	@Test
	public void should_load_user() {

		System.out.println(userRepository.findAll().size());
		User user = userRepository.findByUsername("****")
				.orElseThrow(() -> new UserCustomException("*****"));

		assertEquals("*****", user.getUsername());
	}
}
