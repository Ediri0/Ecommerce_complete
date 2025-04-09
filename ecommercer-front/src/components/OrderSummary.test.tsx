import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom'; // Ensure jest-dom is imported for extended matchers
import OrderSummary from './OrderSummary';

afterEach(cleanup); // Limpieza después de cada prueba

describe('OrderSummary Component', () => {
  it('renders correctly when open', () => {
    const product = { name: 'Product 1', price: 100 };
    render(<OrderSummary product={product} open={true} onClose={() => {}} />);

    expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
    expect(screen.getByText('Producto: Product 1')).toBeInTheDocument();
    expect(screen.getByText('Precio: $100')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const product = { name: 'Product 1', price: 100 };
    render(<OrderSummary product={product} open={false} onClose={() => {}} />);

    expect(screen.queryByText('Resumen del Pedido')).not.toBeInTheDocument();
  });
});