import React, { Component } from 'react';
import { Container, Card } from 'react-bootstrap';
import Wallets from './Wallets';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      walletOwner: '',
    };
  }

  render() {
    const {
      factoryContract,
      factoryOwner,
      accounts,
      walletAddresses,
    } = this.props;

    return (
      <Container className="mt-5">
        <Card>
          <Card.Header className="font-weight-bold">
            Factory Contract Owner: {factoryOwner}
          </Card.Header>
        </Card>
        <Wallets
          factoryContract={factoryContract}
          factoryOwner={factoryOwner}
          accounts={accounts}
          walletAddresses={walletAddresses}
        />
      </Container>
    );
  }
}

export default Home; 
