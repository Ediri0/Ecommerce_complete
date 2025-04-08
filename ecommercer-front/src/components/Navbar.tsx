import React from 'react';
import { Layout, Menu } from 'antd';

const { Header } = Layout;

const Navbar: React.FC = () => {
  const menuItems = [
    {
      key: '1',
      label: 'ECOMMERCE',
    },
  ]; // Define los elementos del menú usando la propiedad `items`

  return (
    <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%' }}>
      <Menu theme="dark" mode="horizontal" items={menuItems} />
    </Header>
  );
};

export default Navbar;