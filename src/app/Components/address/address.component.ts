import { Component, OnInit } from '@angular/core';
import { Address } from 'src/app/Model/address';
import { ApiService } from 'src/app/Service/api.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {
  model:Address={
    address:'',
    city:'',
    state:'',
    country:'',
    zipcode:'',
    phonenumber:''

  };
  auth:string;
  constructor(private api:ApiService) { }

  ngOnInit() {
    this.auth=this.api.getToken();
    this.api.getAddress(this.auth).subscribe(res=>{
      this.model=res.map;
    });
  }

  addAddress(){
    this.api.upAddress(this.auth,this.model).subscribe(res=>{
      console.log(res);
    });
  }

}
