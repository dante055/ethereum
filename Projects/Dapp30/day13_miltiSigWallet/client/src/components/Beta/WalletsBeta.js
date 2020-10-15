import React, { Component } from 'react';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class Wallets extends Component {
  constructor(props) {
    super(props);

    this.state = {
      walletAddresses: [],
    };
  }

  async componentDidMount() {
    const { factoryContract } = this.props;
    const walletAddresses = await factoryContract.methods
      .getAllWalletAddress()
      .call();
    this.setState({ walletAddresses });
  }

  render() {
    const { walletAddresses } = this.state;
    // console.log(this.props);
    const wallet = walletAddresses.map((address) => (
      <Link to={`/wallet/${address}`} className="text-dark" key={address}>
        <Alert variant="dark">{address}</Alert>
      </Link>
    ));
    return (
      <Container className="mt-5">
        <Card>
          {walletAddresses.length ? (
            <React.Fragment>
              <Card.Header className="font-weight-bold">
                Currently Present wallets
              </Card.Header>
              <Card.Body>{wallet}</Card.Body>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Alert variant="danger">Currently u dont have any wallet.</Alert>
              <Card.Body>
                <Link to="/create">
                  <Button variant="primary">Create a Wallet</Button>
                </Link>
              </Card.Body>
            </React.Fragment>
          )}
        </Card>
      </Container>
    );
  }
}

export default Wallets; 
