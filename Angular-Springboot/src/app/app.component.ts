import { Component, OnInit } from '@angular/core';
import { ApiService } from './Service/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private auth: ApiService, private router: Router) {

  }
  ngOnInit() {
      if (this.auth.isAuthenticated()!=null && this.auth.getAuthType() == "customer") {
        this.router.navigate(["/home"]);
      } else if (this.auth.isAuthenticated()!=null && this.auth.getAuthType() == "admin") {
        this.router.navigate(["/admin"]);
      } else {
        this.router.navigate(["/login"]);
      }
   
  }
}
