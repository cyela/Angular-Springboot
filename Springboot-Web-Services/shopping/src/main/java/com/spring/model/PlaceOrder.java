package com.spring.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "Place_Order")
public class PlaceOrder {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "order_id")
	private int orderId;

	private String email;

	@Column(name = "order_status")
	private String orderStatus;

	@Column(name = "order_date")
	private Date orderDate;

	@Column(name = "total_cost")
	private double totalCost;

	public int getOrderId() {
		return orderId;
	}

	public void setOrderId(int orderId) {
		this.orderId = orderId;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Date getOrderDate() {
		return orderDate;
	}

	public void setOrderDate(Date orderDate) {
		this.orderDate = orderDate;
	}

	public double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

	public String getOrderStatus() {
		return orderStatus;
	}

	public void setOrderStatus(String orderStatus) {
		this.orderStatus = orderStatus;
	}

	public PlaceOrder(int orderId, String email, String orderStatus, Date orderDate, double totalCost) {
		super();
		this.orderId = orderId;
		this.email = email;
		this.orderStatus = orderStatus;
		this.orderDate = orderDate;
		this.totalCost = totalCost;
	}

	public PlaceOrder() {
		super();
	}

}