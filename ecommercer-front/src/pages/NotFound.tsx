import React from 'react';
import { Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Title level={2}>404 - Página no encontrada</Title>
      <Paragraph>La página que buscas no existe.</Paragraph>
      <Button type="primary" href="/">
        Volver a la tienda
      </Button>
    </div>
  );
};

export default NotFound;
