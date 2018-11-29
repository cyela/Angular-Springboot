import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Service/api.service';

@Component({
  selector: 'order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.css']
})
export class OrderItemComponent implements OnInit {

  auth:string;
  constructor(private route:Router,private api:ApiService) { }

  ngOnInit() {
    this.auth=this.api.getToken();
    this.api.getOrders(this.auth).subscribe(res=>{
      console.log(res.orderList);
    });
  }

}
