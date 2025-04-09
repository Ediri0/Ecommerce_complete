import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProductList from './ProductList';

// filepath: c:\Desarrollo\GitHub\Ecommerce_complete\ecommercer-front\src\components\ProductList.test.tsx

const mockStore = configureStore([]);
const mockProducts = [
  { id: 1, name: 'Product 1', description: 'Description 1', price: 100, stock: 10, image: 'product1.jpg' },
  { id: 2, name: 'Product 2', description: 'Description 2', price: 200, stock: 5, image: 'product2.jpg' },
];

describe('ProductList Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      products: {
        items: mockProducts,
        status: 'succeeded',
      },
    });
  });

  it('renders products correctly', () => {
    render(
      <Provider store={store}>
        <ProductList />
      </Provider>
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('displays loading message when status is loading', () => {
    store = mockStore({
      products: {
        items: [],
        status: 'loading',
      },
    });

    render(
      <Provider store={store}>
        <ProductList />
      </Provider>
    );

    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
  });

  it('displays error message when status is failed', () => {
    store = mockStore({
      products: {
        items: [],
        status: 'failed',
      },
    });

    render(
      <Provider store={store}>
        <ProductList />
      </Provider>
    );

    expect(screen.getByText('Error al cargar productos.')).toBeInTheDocument();
  });

  it('opens and closes the modal when Comprar button is clicked', () => {
    render(
      <Provider store={store}>
        <ProductList />
      </Provider>
    );

    const buyButton = screen.getAllByText('Comprar')[0];
    fireEvent.click(buyButton);

    expect(screen.getByText('Completa tu pago')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Completa tu pago')).not.toBeInTheDocument();
  });

  it('renders empty state when no products are available', () => {
    store = mockStore({
      products: {
        items: [],
        status: 'succeeded',
      },
    });

    render(
      <Provider store={store}>
        <ProductList />
      </Provider>
    );

    expect(screen.getByText('No hay productos disponibles.')).toBeInTheDocument();
  });
});