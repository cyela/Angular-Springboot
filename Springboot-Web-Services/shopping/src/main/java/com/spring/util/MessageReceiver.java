package com.spring.util;

import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

import com.spring.model.Product;

@Component
public class MessageReceiver {

	private static final String MESSAGE_QUEUE = "product_queue";

	@JmsListener(destination = MESSAGE_QUEUE)
	public void receiveMessage(Product product) {
		System.out.println("Product " + product.getProductname() + "has been added successfully");
	}

}
