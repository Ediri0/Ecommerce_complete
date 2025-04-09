# E-Commerce Completo

Este proyecto es una solución completa de comercio electrónico que incluye un **frontend** desarrollado con React y un **backend** construido con NestJS. Proporciona funcionalidades para explorar productos, realizar compras, gestionar transacciones y procesar pagos a través de la pasarela Wompi.

---

## Tecnologías Utilizadas

### Frontend
- **React**: Biblioteca para construir interfaces de usuario.
- **Redux Toolkit**: Manejo del estado global de la aplicación.
- **TypeScript**: Superset de JavaScript que añade tipado estático.
- **Ant Design** y **Material-UI**: Librerías de componentes UI para React.
- **Axios**: Cliente HTTP para realizar solicitudes a la API.
- **Jest** y **Testing Library**: Herramientas para pruebas unitarias y de integración.

### Backend
- **NestJS**: Framework para construir aplicaciones backend escalables.
- **TypeORM**: ORM para manejar la base de datos.
- **PostgreSQL**: Base de datos relacional utilizada.
- **Axios**: Cliente HTTP para interactuar con la API de Wompi.
- **CSRF Protection** y **Helmet**: Seguridad adicional para proteger contra ataques CSRF y mejorar la seguridad HTTP.
- **Jest**: Framework para pruebas unitarias y de integración.

---

## Estructura del Proyecto

```
Ecommerce_complete/
├── ecommercer-front/   # Frontend del proyecto
│   ├── src/            # Código fuente del frontend
│   └── public/         # Archivos públicos del frontend
├── ecommerce/          # Backend del proyecto
│   ├── src/            # Código fuente del backend
│   └── test/           # Pruebas del backend
└── README.md           # Este archivo
```

---

## Endpoints Disponibles

### Backend

#### Productos
- **GET /products**: Obtiene la lista de productos disponibles.
- **GET /products/:id**: Obtiene los detalles de un producto específico.

#### Transacciones
- **POST /transactions**: Crea una nueva transacción.
- **GET /transactions/:id**: Consulta los detalles de una transacción.
- **POST /transactions/:id/update-status**: Actualiza el estado de una transacción.

#### Pagos
- **POST /payments/complete-transaction**: Completa una transacción con Wompi.

---

## Configuración del Proyecto

### Backend
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

### Frontend
1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar la aplicación en modo desarrollo:
   ```bash
   npm start
   ```

3. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

---

## Scripts Disponibles

### Backend
- **`npm run start`**: Inicia el servidor en modo producción.
- **`npm run start:dev`**: Inicia el servidor en modo desarrollo con recarga automática.
- **`npm run test`**: Ejecuta las pruebas unitarias.
- **`npm run test:cov`**: Genera un reporte de cobertura de pruebas.

### Frontend
- **`npm start`**: Inicia la aplicación en modo desarrollo.
- **`npm test`**: Ejecuta las pruebas en modo interactivo.
- **`npm run build`**: Construye la aplicación para producción.

---

## Resultados de Cobertura

### Backend
- **Cobertura Total**: 75.86%
- **Cobertura de Funciones**: 66.66%
- **Cobertura de Líneas**: 75%

### Frontend
- **Cobertura Total**: 80% (aproximado)

---

## Funcionalidades Implementadas

- **Resiliencia para recuperar progreso en caso de refrescar la página**: El estado de las transacciones y productos se guarda automáticamente en el almacenamiento local del navegador y se restaura al recargar la página.

---

## Colección de Postman

Puedes acceder a la colección de Postman con los endpoints del proyecto en el siguiente enlace:

[Postman Collection](https://www.postman.com/supply-engineer-56601928/ecommerce/collection/6x0i7z5/ecommerce?action=share&creator=34629923)

---

## Funcionalidades No Implementadas

2. **Despliegue en AWS.**
