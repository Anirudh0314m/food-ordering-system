import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '20px',
      textAlign: 'center',
      borderTop: '1px solid #eee',
      marginTop: 'auto'
    }}>
      <p>© {new Date().getFullYear()} Food Delivery App - All rights reserved</p>
    </footer>
  );
};

export default Footer;