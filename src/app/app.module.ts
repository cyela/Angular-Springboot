import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { NavigationComponent } from './Components/navigation/navigation.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { HomeComponent } from './Components/home/home.component';
import { ProductComponent } from './Components/home/product/product.component';
import { CartItemComponent } from './Components/home/cart-item/cart-item.component';
import { AddressComponent } from './Components/home/address/address.component';
import { AdminComponent } from './Components/admin/admin.component';
import { EditItemComponent } from './Components/admin/edit-item/edit-item.component';
import { OrderItemComponent } from './Components/admin/order-item/order-item.component';

import { AuthguardGuard } from './Service/authguard.guard';
import { AuthInterceptor } from './Service/AuthInterceptor';

import { StorageService } from './Service/storage.service'; // Our new storage service

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthguardGuard] },
  { path: 'home/cart', component: CartItemComponent, canActivate: [AuthguardGuard] },
  { path: 'home/address', component: AddressComponent, canActivate: [AuthguardGuard] },
  { path: 'admin/edit', component: EditItemComponent, canActivate: [AuthguardGuard] },
  { path: 'admin/order', component: OrderItemComponent, canActivate: [AuthguardGuard] }
];

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LoginComponent,
    RegisterComponent,
    ProductComponent,
    HomeComponent,
    CartItemComponent,
    AddressComponent,
    AdminComponent,
    EditItemComponent,
    OrderItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    StorageService, // our new storage service
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
