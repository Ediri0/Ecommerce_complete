# E-Commerce Backend

This is the backend for an e-commerce application built with NestJS. It handles product management, transactions, and integration with the Wompi payment gateway.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the `.env` file:
   ```properties
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=123456
   DB_NAME=ecommerce
   PORT=3020
   WOMPI_API_URL=https://sandbox.wompi.co/v1
   WOMPI_PUBLIC_KEY=your_public_key
   WOMPI_PRIVATE_KEY=your_private_key
   ```

3. Run the development server:
   ```bash
   npm run start:dev
   ```

## Endpoints

- **GET /products**: Fetch all products.
- **POST /transactions**: Create a new transaction.
- **POST /payments/complete-transaction**: Complete a transaction with Wompi.
- **POST /payments/complete-transaction-v2**: Complete a transaction with tokens from the frontend.

## Notes

- Ensure the database is running and properly configured.
- Logs are stored in the `logs` directory.
