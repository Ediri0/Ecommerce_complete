// Definimos la interfaz para las transacciones y su repositorio.
// Esto asegura que podamos desacoplar la lógica de negocio de la implementación específica.

export interface ITransaction {
  id?: number; // Revertir el tipo de `id` a number
  idUuid?: string; // Mantener el campo idUuid
  productId?: number;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  deliveryAddress?: string;
  
}

export interface ITransactionRepository {
  save(transaction: ITransaction): Promise<ITransaction>;
  findById(id: number): Promise<ITransaction | null>; // Revertir el tipo de `id` a number
}