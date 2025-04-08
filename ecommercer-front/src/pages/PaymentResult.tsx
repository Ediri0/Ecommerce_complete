import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Spin } from 'antd';

const { Title, Paragraph } = Typography;

const PaymentResult: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionStatus = async () => {
      try {
        const response = await fetch(`/transactions/${transactionId}/status`);
        const data = await response.json();
        setStatus(data.status);
      } catch (error) {
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionStatus();
  }, [transactionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);
    return () => clearTimeout(timer);
  }, [status]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: 'auto' }} />;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {status === 'success' ? (
        <>
          <Title level={2}>¡Pago exitoso!</Title>
          <Paragraph>Tu transacción se completó correctamente.</Paragraph>
          <Button type="primary" href="/">
            Volver a la tienda
          </Button>
        </>
      ) : (
        <>
          <Title level={2} style={{ color: 'red' }}>
            Error en el pago
          </Title>
          <Paragraph>Hubo un problema con tu transacción. Intenta nuevamente.</Paragraph>
          <Button type="primary" href="/">
            Volver a la tienda
          </Button>
        </>
      )}
    </div>
  );
};

export default PaymentResult;
