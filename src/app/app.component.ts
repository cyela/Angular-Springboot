import { Component,OnInit } from '@angular/core';
import { ApiService } from './Service/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private auth:ApiService, private router:Router){

  }
  ngOnInit() {
    if(this.auth.isAuthenticated!=null){
    if(this.auth.isAuthenticated){
      this.router.navigate(["/home"]);
    }
  }else{
      this.router.navigate(["/login"]);
    }
  }
}
