import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api.service';
import { Order } from 'src/app/Model/Order';

@Component({
  selector: 'order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.css']
})
export class OrderItemComponent implements OnInit {

  auth: string;
  orderlist: any[] = [];
  constructor(private route: Router, private api: ApiService) { }

  ngOnInit() {
    this.auth = this.api.getToken();
    this.getOrderList();
  }

  approve(orderid) {
    let order = {
      "orderId": orderid,
      "orderStatus": "Approved"
    }
    this.api.update(this.auth, order).subscribe(res => {
      this.getOrderList();
    });
  }

  decline(orderid) {
    let order = {
      "orderId": orderid,
      "orderStatus": "Declined"
    }
    this.api.update(this.auth, order).subscribe(res => {
      this.getOrderList();
    });
  }

  getOrderList() {
    this.api.getOrders(this.auth).subscribe(res => {
      this.orderlist = res.orderlist;
    });
  }

}
