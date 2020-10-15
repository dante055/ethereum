import React, { Component } from 'react';
import { Container, Card } from 'react-bootstrap';
import Wallets from './Wallets';

class Home extends Component {
  render() {
    const { factoryOwner, walletAddresses, shouldReset } = this.props;

    return (
      <Container className='mt-5'>
        <Card>
          <Card.Header className='font-weight-bold'>
            Factory Contract Owner: {factoryOwner}
          </Card.Header>
        </Card>
        <Wallets walletAddresses={walletAddresses} shouldReset={shouldReset} />
      </Container>
    );
  }
}

export default Home;
