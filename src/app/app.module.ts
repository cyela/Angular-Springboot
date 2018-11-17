import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {StorageServiceModule} from 'angular-webstorage-service';
import {Router, Routes, RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { NavigationComponent } from './Components/navigation/navigation.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { ProductComponent } from './Components/product/product.component';
import { HomeComponent } from './Components/home/home.component';
import { AuthguardGuard } from './Service/authguard.guard';
import { CartItemComponent } from './Components/cart-item/cart-item.component';
import { AddressComponent } from './Components/address/address.component';
import { AdminComponent } from './Components/admin/admin.component';
import { EditItemComponent } from './Components/edit-item/edit-item.component';
const appRoutes:Routes=[
{
  path:'login',
  component: LoginComponent
},
{
  path:'register',
  component: RegisterComponent
},
{
  path:'admin',
  component: AdminComponent
}
,
{
  path:'home',
  component: HomeComponent,
  canActivate:[AuthguardGuard]
},
{
  path:'home/cart',
  component: CartItemComponent,
  canActivate:[AuthguardGuard]
},
{
  path:'home/address',
  component: AddressComponent,
  canActivate:[AuthguardGuard]
},
{
  path:'admin/edit',
  component: EditItemComponent,
  canActivate:[AuthguardGuard]
}
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
    EditItemComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    HttpClientModule,
    StorageServiceModule,
    RouterModule.forRoot(appRoutes),
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
