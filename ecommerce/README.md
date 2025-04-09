# E-Commerce Backend

Este es el backend de una aplicación de comercio electrónico desarrollado con NestJS. Maneja la gestión de productos, transacciones y la integración con la pasarela de pagos Wompi.

---

## Tecnologías Utilizadas

- **NestJS**: Framework para construir aplicaciones backend escalables.
- **TypeORM**: ORM para manejar la base de datos.
- **PostgreSQL**: Base de datos relacional utilizada.
- **Axios**: Cliente HTTP para interactuar con la API de Wompi.
- **CSRF Protection** y **Helmet**: Seguridad adicional para proteger contra ataques CSRF y mejorar la seguridad HTTP.
- **Jest**: Framework para pruebas unitarias y de integración.

---

## Estructura del Proyecto

```
src/
├── application/        # Lógica de negocio (servicios)
├── domain/             # Interfaces y contratos
├── infrastructure/     # Implementaciones específicas (repositorios, servicios externos)
├── products/           # Módulo de productos
├── transactions/       # Módulo de transacciones
├── payments/           # Módulo de pagos
├── images/             # Controlador para servir imágenes
├── utils/              # Utilidades como Either para manejo de errores
├── app.module.ts       # Módulo principal de la aplicación
└── main.ts             # Punto de entrada de la aplicación
```

---

## Configuración del Proyecto

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar el archivo `.env`:
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

3. Ejecutar el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```

---

## Scripts Disponibles

- **`npm run start`**: Inicia el servidor en modo producción.
- **`npm run start:dev`**: Inicia el servidor en modo desarrollo con recarga automática.
- **`npm run test`**: Ejecuta las pruebas unitarias.
- **`npm run test:cov`**: Genera un reporte de cobertura de pruebas.

---

## Resultados de Cobertura

- **Cobertura Total**: 75.86%
- **Cobertura de Funciones**: 66.66%
- **Cobertura de Líneas**: 75%

---

## Espacio para Pantallazos de Postman

_Aquí puedes agregar capturas de pantalla de las pruebas realizadas en Postman para los endpoints mencionados._
