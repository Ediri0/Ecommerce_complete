export interface IProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;

}

export interface IProductRepository {
  findById(id: number): Promise<IProduct | null>;
  findAll(): Promise<IProduct[]>;
  save(product: IProduct): Promise<IProduct>; // Add save method
}

// Ensure this interface defines the core domain logic for products.