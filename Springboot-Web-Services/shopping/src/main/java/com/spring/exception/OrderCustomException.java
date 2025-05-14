package com.spring.exception;

public class OrderCustomException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3061868569889612745L;

	public OrderCustomException(String message) {
		super(message);
	}

}
