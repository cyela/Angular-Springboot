import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/Service/api.service';
import { Product } from 'src/app/Model/product';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products: Product[] = [];
  private auth_token: string;
  constructor(private api: ApiService) { }

  ngOnInit() {
    if (this.api.isAuthenticated) {
      this.auth_token = this.api.getToken();
      this.api.getProducts(this.auth_token).subscribe(
        res => {
          this.products = res.oblist;
        }
      );
    }
  }

  addToCart(e) {
    this.api.addCartItems(e, this.auth_token).subscribe(res => {
      console.log(res);
    })
  }
}
