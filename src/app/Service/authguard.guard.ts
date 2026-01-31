import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthguardGuard  {

  constructor(private auth: ApiService, private router: Router) {
  }
  canActivate(): boolean {
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
