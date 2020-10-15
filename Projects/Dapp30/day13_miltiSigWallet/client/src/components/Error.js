import React from 'react';
import { Container, Alert } from 'react-bootstrap';

function Error() {
  return (
    <Container className='mt-5'>
      <Alert variant='danger' className='mt-2'>
        <h2 className='text-center'>404 Error: Page Not Exist!!</h2>
        <h4 className='text-center'>Try Refreshing the page once!!</h4>
      </Alert>
    </Container>
  );
}

export default Error;
