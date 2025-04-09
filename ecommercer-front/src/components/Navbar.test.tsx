import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from './Navbar';
import '@testing-library/jest-dom'; // Import jest-dom para extended matchers
import { act } from 'react'; // Cambiar la importación de act para usar react directamente

afterEach(cleanup); // Limpieza después de cada prueba

describe('Navbar Component', () => {
  it('renders correctly', () => {
    act(() => {
      render(<Navbar />);
    });
    expect(screen.getByText('ECOMMERCE')).toBeInTheDocument();
  });
});