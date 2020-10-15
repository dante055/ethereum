import React, { Component } from 'react';
import { getWeb3, getFactory } from './utils/utils';
import App from './components/App';
import { Container, Alert } from 'react-bootstrap';

class Load extends Component {
  constructor(props) {
    super(props);

    this.state = {
      web3: undefined,
      accounts: [],
      factoryContract: undefined,
      factoryOwner: '',
    };
  }

  async componentDidMount() {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const factoryContract = await getFactory(web3);
      const factoryOwner = await factoryContract.methods.factoryOwner().call();
      this.setState(
        { web3, accounts, factoryContract, factoryOwner },
        this.getWalletAddress
      );
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { web3, accounts, factoryContract, factoryOwner } = this.state;

    return typeof web3 !== 'undefined' ? (
      <App
        web3={web3}
        accounts={accounts}
        factoryContract={factoryContract}
        factoryOwner={factoryOwner}
      />
    ) : (
      <Container className='mt-5'>
        <Alert variant='danger'>
          <h1>Loading...</h1>
          <h4>
            Either Web3 is been loaded or you dont have the contract deployed
            yet!
          </h4>
          <p>See console for more info!</p>
        </Alert>
      </Container>
    );
  }
}

export default Load;
