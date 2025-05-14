package com.spring.response;

import java.io.Serializable;
import java.util.HashMap;

public class Response implements Serializable {

	private static final long serialVersionUID = 1928909901056236719L;
	private String status;
	private String message;
	private String AUTH_TOKEN;
	private HashMap<String, String> map;

	public HashMap<String, String> getMap() {
		return map;
	}

	public void setMap(HashMap<String, String> map) {
		this.map = map;
	}

	public String getAUTH_TOKEN() {
		return AUTH_TOKEN;
	}

	public void setAUTH_TOKEN(String aUTH_TOKEN) {
		this.AUTH_TOKEN = aUTH_TOKEN;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

}
