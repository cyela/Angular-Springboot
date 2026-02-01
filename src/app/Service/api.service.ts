import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../Model/product';
import { User } from '../Model/user';
import { Address } from '../Model/address';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private storage: StorageService, private http: HttpClient) { }

  // Registering new users to the system
  register(user: User): Observable<any> {
    return this.http.post(
      `${environment.baseUrl}${environment.signupUrl}`,
      JSON.stringify(user),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // validating user credentials
  login(user: User): Observable<any> {
    return this.http.post(
      `${environment.baseUrl}${environment.loginUrl}`,
      JSON.stringify(user),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  logout() {
    return this.http.get<any>(`${environment.baseUrl}${environment.logoutUrl}`);
  }

  // Add Products to the Cart
  addToCart(product: Product): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}${environment.addToCartUrl}?productId=${product.productid}`);
  }

  // View Cart items
  getCartItems(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}${environment.viewCartUrl}`);
  }

  // Update items quantity in the cart
  updateCartItem(prodid: number, quant: number): Observable<any> {
    const map = { id: prodid, quantity: quant };
    return this.http.put<any>(`${environment.baseUrl}${environment.updateCartUrl}`, map);
  }

  // Delete cart item
  deleteCartItem(bufdid: number): Observable<any> {
    return this.http.delete<any>(`${environment.baseUrl}${environment.deleteCartUrl}?bufcartid=${bufdid}`);
  }

  // Update Address
  addOrUpdateAddress(adr: Address): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}${environment.addAddressUrl}`, adr);
  }

  // Fetch address
  getAddress(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}${environment.viewAddressUrl}`);
  }

  // Fetching all the products
  getProducts(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}${environment.productsUrl}`);
  }

  // Add product in the system
  addProduct(desc: string, quan: string, price: string, prodname: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('description', desc);
    formData.append('price', price);
    formData.append('productname', prodname);
    formData.append('quantity', quan);
    formData.append('file', image);
    return this.http.post<any>(`${environment.baseUrl}${environment.addProductUrl}`, formData);
  }

  // Update product for logged-in admin
  updateProduct(desc: string, quan: string, price: string, prodname: string, image: File, productid: any): Observable<any> {
    const formData = new FormData();
    formData.append('description', desc);
    formData.append('price', price);
    formData.append('productname', prodname);
    formData.append('quantity', quan);
    formData.append('file', image);
    formData.append('productId', productid);
    return this.http.put<any>(`${environment.baseUrl}${environment.updateProductUrl}`, formData);
  }

  // Delete Product
  deleteProduct(prodid: number) {
    return this.http.delete<any>(`${environment.baseUrl}${environment.deleteProductUrl}?productId=${prodid}`);
  }

  // Fetch available orders placed
  getOrders() {
    return this.http.get<any>(`${environment.baseUrl}${environment.viewOrderUrl}`);
  }

  // Place the order
  placeOrder(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}${environment.placeOrderUrl}`);
  }

  // Update status for order
  updateStatusForOrder(order: any) {
    const formData = new FormData();
    formData.append('orderId', order.orderId);
    formData.append('orderStatus', order.orderStatus);
    return this.http.post<any>(`${environment.baseUrl}${environment.updateOrderUrl}`, formData);
  }

  // Authentication Methods
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  storeToken(token: string, auth_type: string) {
    this.storage.setSession('auth_token', token);
    this.storage.setSession('auth_type', auth_type);
  }

  getAuthType(): string {
    return this.storage.getSession<string>('auth_type');
  }

  getToken(): string | null {
    return this.storage.getSession<string>('auth_token');
  }

  removeToken() {
    this.storage.removeSession('auth_token');
    this.storage.removeSession('auth_type');
  }
}
