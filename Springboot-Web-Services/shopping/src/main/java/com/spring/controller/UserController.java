package com.spring.controller;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.constants.ResponseCode;
import com.spring.constants.WebConstants;
import com.spring.exception.AddressCustomException;
import com.spring.exception.CartCustomException;
import com.spring.exception.PlaceOrderCustomException;
import com.spring.exception.ProductCustomException;
import com.spring.exception.UserCustomException;
import com.spring.model.Address;
import com.spring.model.Bufcart;
import com.spring.model.PlaceOrder;
import com.spring.model.Product;
import com.spring.model.User;
import com.spring.repository.AddressRepository;
import com.spring.repository.CartRepository;
import com.spring.repository.OrderRepository;
import com.spring.repository.ProductRepository;
import com.spring.repository.UserRepository;
import com.spring.response.CartResponse;
import com.spring.response.ProductResponse;
import com.spring.response.Response;
import com.spring.response.ServerResponse;
import com.spring.response.UserResponse;
import com.spring.util.Validator;

@CrossOrigin(origins = WebConstants.ALLOWED_URL)
@RestController
@RequestMapping("/user")
public class UserController {

	private static Logger logger = Logger.getLogger(UserController.class.getName());

	@Autowired
	private UserRepository userRepo;

	@Autowired
	private AddressRepository addrRepo;

	@Autowired
	private ProductRepository prodRepo;

	@Autowired
	private CartRepository cartRepo;

	@Autowired
	private OrderRepository ordRepo;

	@PostMapping("/addAddress")
	public ResponseEntity<UserResponse> addAddress(@RequestBody Address address, Authentication auth) {
		UserResponse resp = new UserResponse();
		if (Validator.isAddressEmpty(address)) {
			resp.setStatus(ResponseCode.BAD_REQUEST_CODE);
			resp.setMessage(ResponseCode.BAD_REQUEST_MESSAGE);
			return new ResponseEntity<UserResponse>(resp, HttpStatus.NOT_ACCEPTABLE);
		} else {
			try {
				User user = userRepo.findByUsername(auth.getName())
						.orElseThrow(() -> new UsernameNotFoundException(auth.getName()));
				Address userAddress = addrRepo.findByUser(user);
				if (userAddress != null) {
					userAddress.setAddress(address.getAddress());
					userAddress.setCity(address.getCity());
					userAddress.setCountry(address.getCountry());
					userAddress.setPhonenumber(address.getPhonenumber());
					userAddress.setState(address.getState());
					userAddress.setZipcode(address.getZipcode());
					addrRepo.save(userAddress);
				} else {
					user.setAddress(address);
					address.setUser(user);
					addrRepo.save(address);
				}
				resp.setStatus(ResponseCode.SUCCESS_CODE);
				resp.setMessage(ResponseCode.CUST_ADR_ADD);
			} catch (Exception e) {
				throw new AddressCustomException("Unable to add address, please try again");
			}
		}
		return new ResponseEntity<UserResponse>(resp, HttpStatus.OK);
	}

	@GetMapping("/getAddress")
	public ResponseEntity<Response> getAddress(Authentication auth) {
		Response resp = new Response();
		try {
			User user = userRepo.findByUsername(auth.getName()).orElseThrow(
					() -> new UserCustomException("User with username " + auth.getName() + " doesn't exists"));
			Address adr = addrRepo.findByUser(user);

			HashMap<String, String> map = new HashMap<>();
			map.put(WebConstants.ADR_NAME, adr.getAddress());
			map.put(WebConstants.ADR_CITY, adr.getCity());
			map.put(WebConstants.ADR_STATE, adr.getState());
			map.put(WebConstants.ADR_COUNTRY, adr.getCountry());
			map.put(WebConstants.ADR_ZP, String.valueOf(adr.getZipcode()));
			map.put(WebConstants.PHONE, adr.getPhonenumber());

			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.CUST_ADR_ADD);
			resp.setMap(map);
		} catch (Exception e) {
			throw new AddressCustomException("Unable to retrieve address, please try again");
		}
		return new ResponseEntity<Response>(resp, HttpStatus.OK);
	}

	@GetMapping("/getProducts")
	public ResponseEntity<ProductResponse> getProducts(Authentication auth) throws IOException {
		ProductResponse resp = new ProductResponse();
		try {
			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.LIST_SUCCESS_MESSAGE);
			resp.setOblist(prodRepo.findAll());
		} catch (Exception e) {
			throw new ProductCustomException("Unable to retrieve products, please try again");
		}
		return new ResponseEntity<ProductResponse>(resp, HttpStatus.OK);
	}

	@GetMapping("/addToCart")
	public ResponseEntity<ServerResponse> addToCart(@RequestParam(WebConstants.PROD_ID) String productId,
			Authentication auth) throws IOException {

		ServerResponse resp = new ServerResponse();
		try {
			User loggedUser = userRepo.findByUsername(auth.getName())
					.orElseThrow(() -> new UserCustomException(auth.getName()));
			Product cartItem = prodRepo.findByProductid(Integer.parseInt(productId));

			Bufcart buf = new Bufcart();
			buf.setEmail(loggedUser.getEmail());
			buf.setQuantity(1);
			buf.setPrice(cartItem.getPrice());
			buf.setProductId(Integer.parseInt(productId));
			buf.setProductname(cartItem.getProductname());
			Date date = new Date();
			buf.setDateAdded(date);

			cartRepo.save(buf);

			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.CART_UPD_MESSAGE_CODE);
		} catch (Exception e) {
			throw new CartCustomException("Unable to add product to cart, please try again");
		}
		return new ResponseEntity<ServerResponse>(resp, HttpStatus.OK);
	}

	@GetMapping("/viewCart")
	public ResponseEntity<CartResponse> viewCart(Authentication auth) throws IOException {
		logger.info("Inside View cart request method");
		CartResponse resp = new CartResponse();
		try {
			logger.info("Inside View cart request method 2");
			User loggedUser = userRepo.findByUsername(auth.getName())
					.orElseThrow(() -> new UserCustomException(auth.getName()));
			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.VW_CART_MESSAGE);
			resp.setOblist(cartRepo.findByEmail(loggedUser.getEmail()));
		} catch (Exception e) {
			throw new CartCustomException("Unable to retrieve cart items, please try again");
		}

		return new ResponseEntity<CartResponse>(resp, HttpStatus.OK);
	}

	@PutMapping("/updateCart")
	public ResponseEntity<CartResponse> updateCart(@RequestBody HashMap<String, String> cart, Authentication auth)
			throws IOException {

		CartResponse resp = new CartResponse();
		try {
			User loggedUser = userRepo.findByUsername(auth.getName())
					.orElseThrow(() -> new UserCustomException(auth.getName()));
			Bufcart selCart = cartRepo.findByBufcartIdAndEmail(Integer.parseInt(cart.get("id")), loggedUser.getEmail());
			selCart.setQuantity(Integer.parseInt(cart.get("quantity")));
			cartRepo.save(selCart);
			List<Bufcart> bufcartlist = cartRepo.findByEmail(loggedUser.getEmail());
			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.UPD_CART_MESSAGE);
			resp.setOblist(bufcartlist);
		} catch (Exception e) {
			throw new CartCustomException("Unable to update cart items, please try again");
		}

		return new ResponseEntity<CartResponse>(resp, HttpStatus.OK);
	}

	@DeleteMapping("/delCart")
	public ResponseEntity<CartResponse> delCart(@RequestParam(name = WebConstants.BUF_ID) String bufcartid,
			Authentication auth) throws IOException {

		CartResponse resp = new CartResponse();
		try {
			User loggedUser = userRepo.findByUsername(auth.getName())
					.orElseThrow(() -> new UserCustomException(auth.getName()));
			cartRepo.deleteByBufcartIdAndEmail(Integer.parseInt(bufcartid), loggedUser.getEmail());
			List<Bufcart> bufcartlist = cartRepo.findByEmail(loggedUser.getEmail());
			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.DEL_CART_SUCCESS_MESSAGE);
			resp.setOblist(bufcartlist);
		} catch (Exception e) {
			throw new CartCustomException("Unable to delete cart items, please try again");
		}
		return new ResponseEntity<CartResponse>(resp, HttpStatus.OK);
	}

	@GetMapping("/placeOrder")
	public ResponseEntity<ServerResponse> placeOrder(Authentication auth) throws IOException {

		ServerResponse resp = new ServerResponse();
		try {
			User loggedUser = userRepo.findByUsername(auth.getName())
					.orElseThrow(() -> new UserCustomException(auth.getName()));
			PlaceOrder po = new PlaceOrder();
			po.setEmail(loggedUser.getEmail());
			Date date = new Date();
			po.setOrderDate(date);
			po.setOrderStatus(ResponseCode.ORD_STATUS_CODE);
			double total = 0;
			List<Bufcart> buflist = cartRepo.findAllByEmail(loggedUser.getEmail());
			for (Bufcart buf : buflist) {
				total = +(buf.getQuantity() * buf.getPrice());
			}
			po.setTotalCost(total);
			PlaceOrder res = ordRepo.save(po);
			buflist.forEach(bufcart -> {
				bufcart.setOrderId(res.getOrderId());
				cartRepo.save(bufcart);

			});
			resp.setStatus(ResponseCode.SUCCESS_CODE);
			resp.setMessage(ResponseCode.ORD_SUCCESS_MESSAGE);
		} catch (Exception e) {
			throw new PlaceOrderCustomException("Unable to place order, please try again later");
		}
		return new ResponseEntity<ServerResponse>(resp, HttpStatus.OK);
	}
}
