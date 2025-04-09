import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProductIdToTransactions implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar la columna productId como nullable inicialmente
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'productId',
        type: 'int',
        isNullable: true, // Permitir valores NULL temporalmente
      }),
    );

    // Actualizar los registros existentes para asignar un valor por defecto a productId
    await queryRunner.query(`UPDATE transactions SET "productId" = 0 WHERE "productId" IS NULL`);

    // Cambiar la columna productId para que no permita valores NULL
    await queryRunner.changeColumn(
      'transactions',
      'productId',
      new TableColumn({
        name: 'productId',
        type: 'int',
        isNullable: false, // Ahora no permite valores NULL
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la columna productId
    await queryRunner.dropColumn('transactions', 'productId');
  }
}
