import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/Model/user';
import { ApiService } from 'src/app/Service/api.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
model:User={
  email:'',
  username:'',
  password:'',
  usertype:'',
  age:''
};
  constructor(private apiService:ApiService) { }

  ngOnInit() {
  }

  register():void{
    
   this.apiService.register(this.model).
   subscribe(res=>{
     console.log(res);
   },
   err=>{
     alert("An error has occured, Please try again !!!");
   });
  }
}

