import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../Model/product';
import { User } from '../Model/user';
import { SESSION_STORAGE, StorageService } from 'angular-webstorage-service';
import { Address } from '../Model/address';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private REG_API = "http://localhost:8087/user/signup";
  private LOGU_API = "http://localhost:8087/user/verify";
  private LOGA_API = "http://localhost:8087/admin/verify";
  private PRDLST_API = "http://localhost:8087/user/getProducts";
  private ADD_CART_API = "http://localhost:8087/user/addToCart?productId=";
  private VW_CART_API = "http://localhost:8087/user/viewCart";
  private UP_CART_API = "http://localhost:8087/user/updateCart";
  private DEL_CART_API = "http://localhost:8087/user/delCart";
  private PLC_ORD_API = "http://localhost:8087/user/placeOrder";
  private ADR_API = "http://localhost:8087/user/addAddress";
  private GT_ADR_API = "http://localhost:8087/user/getAddress";
  private ADD_PRD_API = "http://localhost:8087/admin/addProduct";
  private DEL_PRD_API = "http://localhost:8087/admin/delProduct";
  private UPD_PRD_API = "http://localhost:8087/admin/updateProducts";
  private ORD_API = "http://localhost:8087/admin/viewOrders";
  private UPD_ORD_API = "http://localhost:8087/admin/updateOrder";

  constructor(@Inject(SESSION_STORAGE) private storage: StorageService, private http: HttpClient) {

  }
  // Registering the users to the database
  register(user: User): Observable<any> {
    return this.http.post(this.REG_API,
      JSON.stringify(user),
      {
        headers:
          { 'Content-Type': 'application/json' }
      });
  }
  // validating user credentials
  userLogin(user: User): Observable<any> {
    return this.http.post(this.LOGU_API,
      JSON.stringify(user),
      {
        headers:
          { 'Content-Type': 'application/json' }
      });
  }

  // validating admin credentials
  adminLogin(user: User): Observable<any> {
    return this.http.post(this.LOGA_API,
      JSON.stringify(user),
      {
        headers:
          { 'Content-Type': 'application/json' }
      });
  }
  // Fetching all the products from the database
  getProducts(auth: string): Observable<any> {

    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.post<any>(this.PRDLST_API, null, { headers: myheader });

  }

  // Add Products to the user Cart
  addCartItems(product: Product, auth: string): Observable<any> {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.ADD_CART_API + product.productid, { headers: myheader });
  }

  // View Cart Items for the logged User

  getCartItems(auth: string): Observable<any> {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.VW_CART_API, { headers: myheader });
  }

  // add items to cart for the logged User
  updateCart(auth: string, prodid: number, quant: number): Observable<any> {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.UP_CART_API + "?bufcartid=" + prodid + "&quantity=" + quant, { headers: myheader });
  }

  // delete cart Item from logged User's Cart item
  delCart(auth: string, bufdid: number): Observable<any> {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.DEL_CART_API + "?bufcartid=" + bufdid, { headers: myheader });
  }

  // place the order of logged User
  place(auth: string): Observable<any> {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.PLC_ORD_API, { headers: myheader });
  }

  // update Address of logged User
  upAddress(auth: string, adr: Address): Observable<any> {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.post<any>(this.ADR_API, adr, { headers: myheader });
  }

  // fetch address of logged user
  getAddress(auth: string): Observable<any> {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.post<any>(this.GT_ADR_API, null, { headers: myheader });
  }


  // Add product for Logged AdminUser

  addProduct(auth: string, desc: string,
    quan: string, price: string, prodname: string, image: File): Observable<any> {

    const formData: FormData = new FormData();
    formData.append("description", desc);
    formData.append("price", price);
    formData.append("productname", prodname);
    formData.append("quantity", quan);
    formData.append("file", image);

    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.post<any>(this.ADD_PRD_API, formData, { headers: myheader });

  }

  // delete Product for Logged Admin User
  delProduct(auth: string, prodid: number) {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.DEL_PRD_API + "?productid=" + prodid, { headers: myheader })
  }

  // delete Product for Logged Admin User
  getOrders(auth: string) {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.ORD_API, { headers: myheader })
  }

  update(auth: string, order: any) {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    const formData: FormData = new FormData();
    formData.append("orderId", order.orderId);
    formData.append("orderStatus", order.orderStatus);
    return this.http.post<any>(this.UPD_ORD_API, formData, { headers: myheader })
  }

  // delete Product for Logged Admin User
  upOrders(auth: string, prodid: number) {
    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.get<any>(this.DEL_PRD_API + "?productid=" + prodid, { headers: myheader })
  }

  // update Product for Logged Admin User
  updateProduct(auth: string, desc: string,
    quan: string, price: string, prodname: string, image: File, productid: any): Observable<any> {

    const formData: FormData = new FormData();
    formData.append("description", desc);
    formData.append("price", price);
    formData.append("productname", prodname);
    formData.append("quantity", quan);
    formData.append("file", image);
    formData.append("productid", productid);

    const myheader = new HttpHeaders().set('AUTH_TOKEN', auth);
    return this.http.post<any>(this.UPD_PRD_API, formData, { headers: myheader });

  }

  // Authentication Methods 

  public isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  storeToken(token: string, auth_type: string) {
    this.storage.set("auth_token", token);
    this.storage.set("auth_type", auth_type);
  }

  getAuthType(): string {
    if (this.storage.get("auth_type") !== null) {
      return this.storage.get("auth_type");
    }
    return null;
  }


  getToken() {
    return this.storage.get("auth_token");
  }

  removeToken() {
    this.storage.remove("auth_type");
    return this.storage.remove("auth_token");
  }

}
