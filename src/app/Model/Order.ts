export class Order {
    orderId: number;
    orderBy: string;
    orderStatus: string;
    products: bufcart[];
}

export class bufcart {
    bufcartId: number;
    orderId: number;
    email: string;
    dateAdded: string;
    quantity: number;
    price: number;
    productId: number;
    productname: string;
}