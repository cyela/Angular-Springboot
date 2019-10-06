### Shopping Application (Angular with SpringBoot Web Services)
---------
E-Commerce application developed for performing Admin and Customer user role operations with respective user interfaces. Application is implemented in two parts:
1. RESTfull web services: API's build using spring boot are used for handling all the back end operations which includes session management using encrypted JWT Tokens 
2. Front End: User interfaces designed and developed using Angular utilising web services for handling appropriate user actions  

#### Features available based on the user role
* Admin
  * Adding products
  * Updating products
  * Deleting products
  * Manage Orders
* Customer
  * Registering into System
  * Login into Website
  * Updating Address
  * Adding product to Cart
  * Updating/ Deleting the Product
  * Placing the order

* Technologies: 
  * Angular 6
  * Typescript
  * Spring Boot
  * Hibernate with JPA 
  * MySQL
  * JWT Token (Session management)

#### Web services project can be found in (https://github.com/cyela/Springboot-Web-Services)

#### Application screenshots
* Login 
    ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/LoginScreen.png)
* Register 
    ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/RegisterScreen.png)
* Customer 
    * Home 
        ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/CustHome.png)
    * Address 
        ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/CustAddress.png)
    * Cart 
        ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/CartScreen.png)
* Admin 
    * Home
        ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/AdminHome.png)
    * Add new product 
        ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/AddProduct.png)
    * Edit product 
        ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/EditProduct.png)
    * View orders 
        ![Image of screenshot](https://github.com/cyela/Angular-Springboot/blob/master/src/assets/Screenshots/OrderScreen.png)
---------
### Development server

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

