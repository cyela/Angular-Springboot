import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../Model/product';
import { User } from '../Model/user';
import {SESSION_STORAGE, StorageService} from 'angular-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
private REG_API="http://localhost:8087/user/signup";
private LOG_API="http://localhost:8087/user/verify";
private PRDLST_API="http://localhost:8087/user/getProducts";

constructor(@Inject(SESSION_STORAGE) private storage:StorageService,private http:HttpClient) { 

  }
// Registering the users to the database
register(user:User):Observable<any>{
  return this.http.post(this.REG_API, 
                          JSON.stringify(user),
                        { headers: 
                            {'Content-Type': 'application/json'} 
                          });
}
// validating credentials
login(user:User):Observable<any>{
  return this.http.post(this.LOG_API, 
    JSON.stringify(user),
  { headers: 
      {'Content-Type': 'application/json'} 
    });
}
// Fetching all the products from the database
getProducts(auth:string):Observable<any>{

  const myheader=new HttpHeaders().set('AUTH_TOKEN', auth);
  return this.http.post<any>(this.PRDLST_API,null,{headers:myheader});
          
}
   
public isAuthenticated():boolean{
  return this.getToken()!==null;
}

storeToken(token:string){
  this.storage.set("auth_token",token);
}

getToken(){
  return this.storage.get("auth_token");
}

removeToken(){
  return this.storage.remove("auth_token");
}

}
