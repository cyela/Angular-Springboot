package com.spring.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.spring.constants.ResponseCode;
import com.spring.constants.WebConstants;
import com.spring.exception.OrderCustomException;
import com.spring.exception.ProductCustomException;
import com.spring.model.PlaceOrder;
import com.spring.model.Product;
import com.spring.repository.CartRepository;
import com.spring.repository.OrderRepository;
import com.spring.repository.ProductRepository;
import com.spring.response.Order;
import com.spring.response.ProductResponse;
import com.spring.response.ServerResponse;
import com.spring.response.ViewOrderResponse;
import com.spring.util.Validator;

@CrossOrigin(origins = WebConstants.ALLOWED_URL)
@RestController
@RequestMapping("/admin")
public class AdminController {

	@Autowired
	private ProductRepository prodRepo;

	@Autowired
	private OrderRepository ordRepo;

	@Autowired
	private CartRepository cartRepo;
	
	@Autowired
	private JmsTemplate jmsTemplate;

	@PostMapping("/addProduct")
	public ResponseEntity<ProductResponse> addProduct(
			@RequestParam(name = WebConstants.PROD_FILE, required = false) MultipartFile prodImage,
			@RequestParam(name = WebConstants.PROD_DESC) String description,
			@RequestParam(name = WebConstants.PROD_PRICE) String price,
			@RequestParam(name = WebConstants.PROD_NAME) String productname,
			@RequestParam(name = WebConstants.PROD_QUANITY) String quantity) throws IOException {
		ProductResponse resp = new ProductResponse();
		if (Validator.isStringEmpty(productname) || Validator.isStringEmpty(description)
				|| Validator.isStringEmpty(price) || Validator.isStringEmpty(quantity)) {
			resp.setStatus(ResponseCode.BAD_REQUEST_CODE);
			resp.setMessage(ResponseCode.BAD_REQUEST_MESSAGE);
			return new ResponseEntity<ProductResponse>(resp, HttpStatus.NOT_ACCEPTABLE);
		} else {
			try {
				Product prod = new Product();
				prod.setDescription(description);
				prod.setPrice(Double.parseDouble(price));
				prod.setProductname(productname);
				prod.setQuantity(Integer.parseInt(quantity));
				if (prodImage != null) {
					prod.setProductimage(prodImage.getBytes());
				}
				prodRepo.save(prod);
				jmsTemplate.convertAndSend("product_queue", prod);
				resp.setStatus(ResponseCode.SUCCESS_CODE);
				resp.setMessage(ResponseCode.ADD_SUCCESS_MESSAGE);
				resp.setOblist(prodRepo.findAll());
			} catch (Exception e) {
				throw new ProductCustomException("Unable to save product details, please try again");
			}
		}
		return new ResponseEntity<ProductResponse>(resp, HttpStatus.OK);
	}

	@PutMapping("/updateProducts")
	public ResponseEntity<ServerResponse> updateProducts(
			@RequestParam(name = WebConstants.PROD_FILE, required = false) MultipartFile prodImage,
			@RequestParam(name = WebConstants.PROD_DESC) String description,
			@RequestParam(name = WebConstants.PROD_PRICE) String price,
			@RequestParam(name = WebConstants.PROD_NAME) String productname,
			@RequestParam(name = WebConstants.PROD_QUANITY) String quantity,
			@RequestParam(name = WebConstants.PROD_ID) String productid) throws IOException {
		ServerResponse resp = new ServerResponse();
		if (Validator.isStringEmpty(productname) || Validator.isStringEmpty(description)
				|| Validator.isStringEmpty(price) || Validator.isStringEmpty(quantity)) {
			resp.setStatus(ResponseCode.BAD_REQUEST_CODE);
			resp.setMessage(ResponseCode.BAD_REQUEST_MESSAGE);
			return new ResponseEntity<ServerResponse>(resp, HttpStatus.NOT_ACCEPTABLE);
		} else {
			try {
				if (prodImage != null) {
					Product prod = new Product(Integer.parseInt(productid), description, productname,
							Double.parseDouble(price), Integer.parseInt(quantity), prodImage.getBytes());
					prodRepo.save(prod);
				} else {
					Product prodOrg = prodRepo.findByProductid(Integer.parseInt(productid));
					Product prod = new Product(Integer.parseInt(productid), description, productname,
							Double.parseDouble(price), Integer.parseInt(quantity), prodOrg.getProductimage());
					prodRepo.save(prod);
				}
				resp.setStatus(ResponseCode.SUCCESS_CODE);
				resp.setMessage(ResponseCode.UPD_SUCCESS_MESSAGE);
			} catch (Exception e) {
				throw new ProductCustomException("Unable to update product details, please try again");
			}
		}
		return new ResponseEntity<ServerResponse>(resp, HttpStatus.OK);
	}

	@DeleteMapping("/delProduct")
	public ResponseEntity<ProductResponse> delProduct(@RequestParam(name = WebConstants.PROD_ID) String productid)
			throws IOException {
		ProductResponse resp = new ProductResponse();
		if (Validator.isStringEmpty(productid)) {
			resp.setStatus(ResponseCode.BAD_REQUEST_CODE);
			resp.setMessage(ResponseCode.BAD_REQUEST_MESSAGE);
			return new ResponseEntity<ProductResponse>(resp, HttpStatus.NOT_ACCEPTABLE);
		} else {
			try {
				prodRepo.deleteByProductid(Integer.parseInt(productid));
				resp.setStatus(ResponseCode.SUCCESS_CODE);
				resp.setMessage(ResponseCode.DEL_SUCCESS_MESSAGE);
			} catch (Exception e) {
				throw new ProductCustomException("Unable to delete product details, please try again");
			}
		}
		return new ResponseEntity<ProductResponse>(resp, HttpStatus.OK);
	}

	@GetMapping("/viewOrders")
	public ResponseEntity<ViewOrderResponse> viewOrders() throws IOException {

		ViewOrderResponse resp = new ViewOrderResponse();
		try {
			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.VIEW_SUCCESS_MESSAGE);
			List<Order> orderList = new ArrayList<>();
			List<PlaceOrder> poList = ordRepo.findAll();
			poList.forEach((po) -> {
				Order ord = new Order();
				ord.setOrderBy(po.getEmail());
				ord.setOrderId(po.getOrderId());
				ord.setOrderStatus(po.getOrderStatus());
				ord.setProducts(cartRepo.findAllByOrderId(po.getOrderId()));
				orderList.add(ord);
			});
			resp.setOrderlist(orderList);
		} catch (Exception e) {
			throw new OrderCustomException("Unable to retrieve orderss, please try again");
		}

		return new ResponseEntity<ViewOrderResponse>(resp, HttpStatus.OK);
	}

	@PostMapping("/updateOrder")
	public ResponseEntity<ServerResponse> updateOrders(@RequestParam(name = WebConstants.ORD_ID) String orderId,
			@RequestParam(name = WebConstants.ORD_STATUS) String orderStatus) throws IOException {

		ServerResponse resp = new ServerResponse();
		if (Validator.isStringEmpty(orderId) || Validator.isStringEmpty(orderStatus)) {
			resp.setStatus(ResponseCode.BAD_REQUEST_CODE);
			resp.setMessage(ResponseCode.BAD_REQUEST_MESSAGE);
			return new ResponseEntity<ServerResponse>(resp, HttpStatus.NOT_ACCEPTABLE);
		} else {
			try {
				PlaceOrder pc = ordRepo.findByOrderId(Integer.parseInt(orderId));
				pc.setOrderStatus(orderStatus);
				pc.setOrderDate(new Date(System.currentTimeMillis()));
				ordRepo.save(pc);
				resp.setStatus(ResponseCode.SUCCESS_CODE);
				resp.setMessage(ResponseCode.UPD_ORD_SUCCESS_MESSAGE);
			} catch (Exception e) {
				throw new OrderCustomException("Unable to retrieve orderss, please try again");
			}
		}
		return new ResponseEntity<ServerResponse>(resp, HttpStatus.OK);
	}
}
