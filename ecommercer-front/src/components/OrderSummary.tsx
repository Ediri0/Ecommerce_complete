import React from 'react';
import { Card, Typography, Button } from 'antd';

interface OrderSummaryProps {
  product: any;
  open: boolean;
  onClose: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ product, open, onClose }) => {
  if (!open) return null;

  return (
    <Card
      title="Resumen del Pedido"
      style={{ maxWidth: 400, margin: 'auto' }}
      actions={[
        <Button type="primary" onClick={onClose}>
          Confirmar
        </Button>,
      ]}
    >
      <Typography.Text>Producto: {product.name}</Typography.Text>
      <br />
      <Typography.Text>Precio: ${product.price}</Typography.Text>
      <br />
      <Typography.Text>Tarifa base: $5</Typography.Text>
      <br />
      <Typography.Text>Tarifa de envío: $10</Typography.Text>
    </Card>
  );
};

export default OrderSummary;