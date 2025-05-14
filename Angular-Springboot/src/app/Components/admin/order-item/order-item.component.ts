import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api.service';

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

  approve(orderid:any) {
    let order = {
      "orderId": orderid,
      "orderStatus": "Approved"
    }
    this.api.updateStatusForOrder( order).subscribe(res => {
      this.getOrderList();
    });
  }

  decline(orderid:any) {
    let order = {
      "orderId": orderid,
      "orderStatus": "Declined"
    }
    this.api.updateStatusForOrder(order).subscribe(res => {
      this.getOrderList();
    });
  }

  getOrderList() {
    this.api.getOrders().subscribe(res => {
      this.orderlist = res.orderlist;
    });
  }

}
