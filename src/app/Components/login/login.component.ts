import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/Model/user';
import { ApiService } from 'src/app/Service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model:User={
    email:'',
    username:'',
    password:'',
    usertype:'',
    age:''
  };
  constructor(private apiService:ApiService,private router:Router) { }

  ngOnInit() {
  }

  login():void{
    this.apiService.login(this.model).
    subscribe(res=>{
      if(res.status=="200"){
          this.apiService.storeToken(res.auth_TOKEN);
          this.router.navigate(['/home']);
      }else{
        this.router.navigate(['/login']);
      }
    },
    err=>{
      alert("An error has occured, Please try again !!!");
    });
   }
}
