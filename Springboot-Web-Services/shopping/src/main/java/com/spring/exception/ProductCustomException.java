package com.spring.exception;

public class ProductCustomException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = -291211739734090347L;

	public ProductCustomException(String message) {
		super(message);
	}

}
