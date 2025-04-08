import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/productSlice';
import { Product } from '../types/types';
import { AppDispatch } from '../redux/store';
import { Row, Col, Card, Button, Typography } from 'antd';
import PaymentModal from './PaymentModal';

const { Meta } = Card;
const { Text } = Typography;

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status } = useSelector((state: any) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  if (status === 'loading') return <p style={{ textAlign: 'center', color: 'gray' }}>Cargando productos...</p>;
  if (status === 'failed') return <p style={{ textAlign: 'center', color: 'red' }}>Error al cargar productos.</p>;

  return (
    <div className="container">
      <Row gutter={[16, 16]} justify="center">
        {items.map((product: Product) => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Card
              hoverable
              cover={<img alt={product.name} src={`http://localhost:3020/images/${product.image}`} />}
              actions={[
                <Button type="primary" onClick={() => handleOpenModal(product)}>
                  Comprar
                </Button>,
                <Button type="primary" onClick={() => handleOpenModal(product)}>
                  Pay with Credit Card
                </Button>,
              ]}
            >
              <Meta title={product.name} description={product.description} />
              <Text style={{ display: 'block', marginTop: '10px', color: '#1890ff' }}>
                ${product.price}
              </Text>
              <Text style={{ color: '#8c8c8c' }}>Stock: {product.stock}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedProduct && (
        <PaymentModal
          open={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
          amount={selectedProduct.price}
        />
      )}
    </div>
  );
};

export default ProductList;