import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import NotFound from './pages/NotFound';
import PaymentResult from './pages/PaymentResult';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/resultado/:transactionId" element={<PaymentResult />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;