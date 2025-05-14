package com.spring.exception;

public class AddressCustomException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = -1472518489094643955L;

	public AddressCustomException(String message) {
		super(message);
	}

}
