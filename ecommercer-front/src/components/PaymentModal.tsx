import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Checkbox, Typography, Alert, Spin } from 'antd';
import { get, post } from '../api/api';
import './PaymentModal.css';

const { Text, Link } = Typography;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, productId, amount }) => {
  const [form] = Form.useForm();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [personalDataAccepted, setPersonalDataAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState<string | undefined>(undefined);
  const [dataUsagePolicyLink, setDataUsagePolicyLink] = useState<string | undefined>(undefined);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [acceptanceToken, setAcceptanceToken] = useState<string | undefined>(undefined);
  const [personalAuthToken, setPersonalAuthToken] = useState<string | undefined>(undefined);
  const [transactionSummary, setTransactionSummary] = useState<{
    status: string;
    transactionId: string;
    cardHolder: string;
    cardNumber: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const fetchPublicInfo = async () => {
      try {
        const data = await get('/payments/public-info');
        setPrivacyPolicyLink(data.data.presigned_acceptance.permalink);
        setDataUsagePolicyLink(data.data.presigned_personal_data_auth.permalink);
        setAcceptanceToken(data.data.presigned_acceptance.acceptance_token);
        setPersonalAuthToken(data.data.presigned_personal_data_auth.acceptance_token);
      } catch (error) {
        console.error('Error fetching public info:', error);
      }
    };

    fetchPublicInfo();
  }, []);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setCardBrand(null);
      setTermsAccepted(false);
      setPersonalDataAccepted(false);
      setError(null);
    }
  }, [open, form]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cardNumber = e.target.value;
    if (cardNumber.startsWith('4')) {
      setCardBrand('visa');
    } else if (cardNumber.startsWith('5')) {
      setCardBrand('mastercard');
    } else {
      setCardBrand(null);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const formattedValue = value.replace(/^(\d{2})(\d{1,2})?$/, (_, mm, yy) =>
        yy ? `${mm}/${yy}` : mm,
      );
      form.setFieldsValue({ expiryDate: formattedValue });
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (!termsAccepted || !personalDataAccepted) {
        throw new Error('Debes aceptar los términos y condiciones y autorizar el uso de tus datos personales.');
      }

      // Paso 1: Crear la transacción en el backend
      const transaction = await post('/transactions', {
        productId,
        amount,
        currency: 'COP',
        reference: `order_${productId}_${Date.now()}`,
      });

      // Paso 2: Llamar al endpoint de Wompi para completar el pago
      const paymentResult = await post('/payments/complete-transaction-v2', {
        number: values.cardNumber.replace(/\s+/g, ''), // Eliminar espacios del número de tarjeta
        cvc: values.cvv,
        exp_month: values.expiryDate.split('/')[0], // Extraer el mes de expiración
        exp_year: values.expiryDate.split('/')[1], // Enviar solo los últimos dos dígitos del año
        card_holder: values.cardHolder,
        amount: Number(amount).toFixed(2), // Asegurar que amount sea un número antes de usar toFixed
        currency: 'COP',
        reference: transaction.idUuid,
        acceptance_token: acceptanceToken,
        accept_personal_auth: personalAuthToken,
      }).catch((error) => {
        console.error('Error en el pago:', error.message);
        return { status: 'FAILED' };
      });

      // Paso 3: Actualizar la transacción en el backend
      await post(`/transactions/${transaction.id}/update-status`, {
        status: paymentResult.status || 'FAILED',
      });

      // Mostrar el resumen de la transacción
      setTransactionSummary({
        status: paymentResult.status || 'FAILED',
        transactionId: transaction.idUuid,
        cardHolder: values.cardHolder,
        cardNumber: values.cardNumber.replace(/\d(?=\d{4})/g, '*'), // Enmascarar el número de tarjeta
        amount,
      });
    } catch (error) {
      Modal.error({
        title: 'Error en el proceso de pago',
        content: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={<Typography.Title level={3} style={{ textAlign: 'center', margin: 0 }}>Completa tu pago</Typography.Title>}
        open={open && !transactionSummary}
        onCancel={onClose}
        footer={null}
        className="payment-modal-container"
        centered
      >
        <div className="payment-modal">
          <div className="user-details" style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Typography.Text strong style={{ display: 'block', fontSize: '16px' }}>Nombre: Pepito Pérez</Typography.Text>
            <Typography.Text strong style={{ display: 'block', fontSize: '16px' }}>Correo: pepito_perez@example.com</Typography.Text>
            <Typography.Text strong style={{ display: 'block', fontSize: '16px' }}>Teléfono: 3107654321</Typography.Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: '400px', margin: '0 auto' }}
          >
            <Form.Item
              label="Número de tarjeta"
              name="cardNumber"
              rules={[{ required: true, message: 'Por favor, ingresa el número de tu tarjeta' }]}
            >
              <Input
                placeholder="1234 5678 9012 3456"
                onChange={handleCardNumberChange}
                prefix={
                  <div style={{ width: 24, height: 24 }}>
                    {cardBrand && (
                      <img
                        src={`/icons/${cardBrand}.png`}
                        alt={cardBrand}
                        className="card-brand-icon"
                        style={{ width: '100%', height: '100%' }}
                      />
                    )}
                  </div>
                }
              />
            </Form.Item>
            <Form.Item
              label="Fecha de expiración (MM/YY)"
              name="expiryDate"
              rules={[{ required: true, message: 'Por favor, ingresa la fecha de expiración' }]}
            >
              <Input placeholder="MM/YY" maxLength={5} onChange={handleExpiryDateChange} />
            </Form.Item>
            <Form.Item
              label="CVV"
              name="cvv"
              rules={[{ required: true, message: 'Por favor, ingresa el CVV' }]}
            >
              <Input placeholder="123" maxLength={3} />
            </Form.Item>
            <Form.Item
              label="Nombre del titular"
              name="cardHolder"
              rules={[{ required: true, message: 'Por favor, ingresa el nombre del titular' }]}
            >
              <Input placeholder="Juan Pérez" />
            </Form.Item>
            <Form.Item
              label="Delivery Address"
              name="deliveryAddress"
              rules={[{ required: true, message: 'Please enter your delivery address' }]}
            >
              <Input placeholder="123 Main St, City, Country" />
            </Form.Item>
            <Form.Item
              label="Número de teléfono"
              name="phoneNumber"
              rules={[{ required: true, message: 'Por favor, ingresa tu número de teléfono' }]}
            >
              <Input placeholder="3107654321" />
            </Form.Item>

            <div className="terms-section" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <Checkbox
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="terms-checkbox"
                  style={{ marginRight: '8px' }}
                />
                <Typography.Text>
                  Acepto los <Link href={privacyPolicyLink} target="_blank">términos y condiciones</Link>
                </Typography.Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  onChange={(e) => setPersonalDataAccepted(e.target.checked)}
                  className="terms-checkbox"
                  style={{ marginRight: '8px' }}
                />
                <Typography.Text>
                  Autorizo el uso de mis datos personales según la{' '}
                  <Link href={dataUsagePolicyLink} target="_blank">política de privacidad</Link>
                </Typography.Text>
              </div>
            </div>

            {error && (
              <Alert
                message="Error en el pago"
                description={error}
                type="error"
                showIcon
                className="error-alert"
                style={{ marginBottom: '16px' }}
              />
            )}
            {loading && <Spin size="large" style={{ display: 'block', margin: '16px auto' }} />}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                disabled={!termsAccepted || !personalDataAccepted || loading}
                className="submit-button"
                style={{ marginBottom: '8px' }}
              >
                Pagar
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={onClose} block>
                Cancelar
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {transactionSummary && (
        <Modal
          title={<Typography.Title level={4} style={{ textAlign: 'center', margin: 0 }}>Resumen de la Transacción</Typography.Title>}
          open={!!transactionSummary}
          onCancel={() => {
            setTransactionSummary(null);
            onClose();
          }}
          footer={null}
          className="transaction-summary-modal"
          centered
        >
          <div className="transaction-summary" style={{ textAlign: 'center' }}>
            <div
              className={`status-icon ${
                transactionSummary.status === 'APPROVED' ? 'success' : 'failure'
              }`}
              style={{
                fontSize: '48px',
                marginBottom: '16px',
                color: transactionSummary.status === 'APPROVED' ? 'green' : 'red',
              }}
            >
              {transactionSummary.status === 'APPROVED' ? '✔️' : '❌'}
            </div>
            <Typography.Title level={4}>
              {transactionSummary.status === 'APPROVED'
                ? 'Pago Exitoso'
                : 'Pago Fallido'}
            </Typography.Title>
            <Typography.Paragraph>
              <Text strong>ID de Transacción:</Text> {transactionSummary.transactionId}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Text strong>Nombre del Titular:</Text> {transactionSummary.cardHolder}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Text strong>Número de Tarjeta:</Text> {transactionSummary.cardNumber}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <Text strong>Monto:</Text> COP {Number(transactionSummary.amount).toFixed(2)}
            </Typography.Paragraph>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PaymentModal;