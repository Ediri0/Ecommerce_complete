export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image?: string; // URL de la imagen del producto
  }
  
  export interface Transaction {
    id: string;
    status: string;
    amount: number;
    productId: number;
  }