package com.spring.response;

import java.util.List;

import com.spring.model.Bufcart;

public class OrderResponse {

	private int orderId;

	public int getOrderId() {
		return orderId;
	}

	public void setOrderId(int orderId) {
		this.orderId = orderId;
	}

	private List<Bufcart> cartList;

	@Override
	public String toString() {
		return "orderResp [orderId=" + orderId + ", cartList=" + cartList + "]";
	}

	public List<Bufcart> getCartList() {
		return cartList;
	}

	public void setCartList(List<Bufcart> cartList) {
		this.cartList = cartList;
	}
}