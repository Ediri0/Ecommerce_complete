# E-Commerce Frontend

Este es el frontend de una aplicación de comercio electrónico desarrollada con React. Proporciona una interfaz de usuario para explorar productos, realizar compras y gestionar transacciones.

---

## Tecnologías Utilizadas

- **React**: Biblioteca para construir interfaces de usuario.
- **Redux Toolkit**: Manejo del estado global de la aplicación.
- **TypeScript**: Superset de JavaScript que añade tipado estático.
- **Ant Design** y **Material-UI**: Librerías de componentes UI para React.
- **Axios**: Cliente HTTP para realizar solicitudes a la API.
- **Jest** y **Testing Library**: Herramientas para pruebas unitarias y de integración.

---

## Estructura del Proyecto

```
src/
├── api/                # Configuración de Axios y métodos reutilizables
├── components/         # Componentes reutilizables como Navbar, ProductList, etc.
├── pages/              # Páginas principales como NotFound y PaymentResult
├── redux/              # Configuración de Redux y slices para manejar el estado
├── types/              # Definiciones de tipos TypeScript
├── App.tsx             # Componente principal de la aplicación
├── index.tsx           # Punto de entrada de la aplicación
├── setupTests.ts       # Configuración para pruebas
└── index.css           # Estilos globales
```

---

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm start`

Inicia la aplicación en modo de desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en el navegador.

### `npm test`

Ejecuta las pruebas en modo interactivo.\
Consulta la sección sobre [pruebas](https://facebook.github.io/create-react-app/docs/running-tests) para más información.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`.\
Optimiza React para el mejor rendimiento.

---

## Resultados de Cobertura

- **Cobertura Total**: 80% (aproximado)

---

## Funcionalidades No Implementadas

3. **Despliegue en AWS.**
