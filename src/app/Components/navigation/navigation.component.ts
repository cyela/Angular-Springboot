import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/Service/api.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  private loggedType:string;
  constructor(private auth:ApiService) { }

  ngOnInit() {
    console.log(this.auth.getAuthType());
    if(this.auth.getAuthType()=="customer"){
        
        this.loggedType="customer";
    }else if(this.auth.getAuthType()=="admin"){
      this.loggedType="admin";
    }else{
      this.loggedType="home";
    }
  }

}
