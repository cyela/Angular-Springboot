package com.spring.exception;

public class UserCustomException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public UserCustomException(String message) {
		super(message);
	}
}
