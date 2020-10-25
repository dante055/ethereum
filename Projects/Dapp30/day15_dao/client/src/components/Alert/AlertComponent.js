import React from 'react';
import Alert from 'react-bootstrap/Alert';

function AlertComponent({ variant, heading, msg }) {
  return (
    <Alert className='text-left mt-2' variant={variant}>
      <Alert.Heading>{heading}</Alert.Heading>
      <p>{msg}</p>
    </Alert>
  );
}

export default AlertComponent;
