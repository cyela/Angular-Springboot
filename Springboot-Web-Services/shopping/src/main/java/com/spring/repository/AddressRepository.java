package com.spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.spring.model.Address;
import com.spring.model.User;

@Repository
@Transactional
public interface AddressRepository extends JpaRepository<Address, Long> {

	Address findByUser(User user);
}
