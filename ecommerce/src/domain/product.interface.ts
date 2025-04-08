export interface IProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number; // Add stock property
}

export interface IProductRepository {
  findById(id: number): Promise<IProduct | null>;
  findAll(): Promise<IProduct[]>;
  save(product: IProduct): Promise<IProduct>; // Add save method
}