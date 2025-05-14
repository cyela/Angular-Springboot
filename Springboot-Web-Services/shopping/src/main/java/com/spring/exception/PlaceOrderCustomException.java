package com.spring.exception;

public class PlaceOrderCustomException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3006580967312049506L;

	public PlaceOrderCustomException(String message) {
		super(message);
	}

}
