package com.spring.response;

import java.util.List;

import com.spring.model.Bufcart;

public class CartResponse {
	private String status;
	private String message;
	private String AUTH_TOKEN;
	private List<Bufcart> oblist;

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

	public String getAUTH_TOKEN() {
		return AUTH_TOKEN;
	}

	public void setAUTH_TOKEN(String aUTH_TOKEN) {
		AUTH_TOKEN = aUTH_TOKEN;
	}

	public List<Bufcart> getOblist() {
		return oblist;
	}

	public void setOblist(List<Bufcart> oblist) {
		this.oblist = oblist;
	}
}