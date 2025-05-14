package com.spring.util;

import com.spring.model.Address;
import com.spring.model.Bufcart;
import com.spring.model.PlaceOrder;
import com.spring.model.Product;
import com.spring.model.User;

public class Validator {

	public static boolean isAlphaNumerical(String input) {

		if (input != null && input != "") {
			if (input.matches("[a-zA-Z0-9]*")) {
				return true;
			}
		}
		return false;
	}

	public static boolean isNumerical(String input) {
		if (input != null && input != "") {
			if (input.matches("[0-9]*")) {
				return true;
			}
		}
		return false;
	}

	public static boolean isValidEmail(String input) {
		if (input != null && input != "") {
			if (input.matches("^[a-zA-Z0-9._]*@[a-zA-Z0-9.-]*$")) {
				return true;
			}
		}
		return false;
	}

	public static boolean isImageFile(String input) {
		if (input != null && input != "") {
			input = input.toLowerCase();
			if (input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif")) {
				return true;
			}
		}
		return false;
	}

	public static String removeSpaces(String input) {
		String filterInput = "";
		if (input != null && input != "") {
			filterInput = input.replace(" ", "");
		}
		return filterInput;
	}

	public static boolean isUserEmpty(User user) {
		if (user.getAge() == 0) {
			return true;
		}
		if (user.getPassword() == null || user.getPassword() == "") {
			return true;
		}
		if (user.getEmail() == null || user.getEmail() == "") {
			return true;
		}
		if (user.getUsername() == null || user.getUsername() == "") {
			return true;
		}
		return false;
	}

	public static boolean isAddressEmpty(Address address) {
		if (address.getAddress() == null || address.getAddress() == "") {
			return true;
		}
		if (address.getCity() == null || address.getCity() == "") {
			return true;
		}
		if (address.getState() == null || address.getState() == "") {
			return true;
		}
		if (address.getCountry() == null || address.getCountry() == "") {
			return true;
		}
		if (address.getPhonenumber() == null || address.getPhonenumber() == "") {
			return true;
		}
		if (address.getZipcode() == 0) {
			return true;
		}
		return false;
	}

	public static boolean isProductEmpty(Product prod) {

		if (prod.getProductname() == null || prod.getProductname() == "") {
			return true;
		}
		if (prod.getDescription() == null || prod.getDescription() == "") {
			return true;
		}
		if (prod.getPrice() == 0) {
			return true;
		}
		if (prod.getQuantity() == 0) {
			return true;
		}
		return false;
	}

	public static boolean isPlaceOrderEmpty(PlaceOrder plaOrd) {

		if (plaOrd.getEmail() == null || plaOrd.getEmail() == "") {
			return true;
		}
		if (plaOrd.getOrderDate() == null) {
			return true;
		}
		if (plaOrd.getTotalCost() == 0) {
			return true;
		}
		if (plaOrd.getOrderStatus() == null || plaOrd.getOrderStatus() == "") {
			return true;
		}
		return false;
	}

	public static boolean isCartEmpty(Bufcart cart) {

		if (cart.getEmail() == null || cart.getEmail() == "") {
			return true;
		}
		if (cart.getProductname() == null || cart.getProductname() == "") {
			return true;
		}
		if (cart.getDateAdded() == null) {
			return true;
		}
		if (cart.getQuantity() == 0) {
			return true;
		}
		if (cart.getPrice() == 0) {
			return true;
		}
		return false;
	}

	public static boolean isStringEmpty(String input) {
		if (input == null || input.equals("")) {
			return true;
		}
		return false;
	}
}
