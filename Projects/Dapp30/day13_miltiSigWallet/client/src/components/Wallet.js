import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { getMultiSigWalletInstance } from '../utils/muliSigWalletInstance';
import WalletDetails from './WalletDetails';
import Deposite from './Deposite';
import CreateTransfer from './CreateTransfer';
import Approve from './Approve';

const display = {
  display: 'flex',
  flexWrap: 'wrap',
};

export class Wallet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      walletAddress: '',
      walletInstance: undefined,
      walletOwner: '',
      approvers: [],
      quorum: undefined,
      walletBalance: undefined,
      transfersLength: undefined,
    };
  }

  async componentDidMount() {
    if (this.props.shouldReset === true) {
      console.log('reset');
      window.location.reload(true);
    }
    const walletAddress = this.props.match.match.path.split('/wallet/').pop();
    // walletAddress = walletAddress.split('/').shift();
    const { web3 } = this.props;
    const walletInstance = await getMultiSigWalletInstance(walletAddress, web3);
    const walletOwner = await walletInstance.methods.walletOwner().call();
    const approvers = await walletInstance.methods.getAllApprovers().call();
    const quorum = await walletInstance.methods.quorum().call();
    const walletBalance = await walletInstance.methods.balanceOf().call();
    const transfers = await walletInstance.methods.getAllTransfers().call();
    const transfersLength = transfers.length;
    this.setState({
      walletAddress,
      walletInstance,
      walletOwner,
      approvers,
      quorum,
      walletBalance,
      transfersLength,
    });
  }

  updateWalletBalance = async () => {
    const { walletInstance } = this.state;
    const walletBalance = await walletInstance.methods.balanceOf().call();
    this.setState({ walletBalance });
  };

  depositeAmount = async (amount) => {
    const { walletAddress, walletInstance } = this.state;
    const { accounts, web3 } = this.props;
    await web3.eth.sendTransaction({
      to: walletAddress,
      from: accounts[0],
      value: amount,
    });
    const walletBalance = await walletInstance.methods.balanceOf().call();
    this.setState({ walletBalance });
  };

  createTransfer = async (to, amount) => {
    const { walletInstance } = this.state;
    const { accounts } = this.props;
    await walletInstance.methods
      .createTransfer(to, amount)
      .send({ from: accounts[0] });
    const transfers = await walletInstance.methods.getAllTransfers().call();
    const transfersLength = transfers.length;

    this.setState({ transfersLength });
  };

  render() {
    const {
      walletInstance,
      walletAddress,
      walletOwner,
      approvers,
      quorum,
      walletBalance,
      transfersLength,
    } = this.state;
    const { accounts } = this.props;
    // console.log('parent render');

    return (
      <Container className="mt-5">
        <Row style={display}>
          <Col md="6">
            <WalletDetails
              walletAddress={walletAddress}
              walletOwner={walletOwner}
              approvers={approvers}
              quorum={quorum}
              walletBalance={walletBalance}
              transfers={transfersLength}
            />
          </Col>
          <Col md="6" className="mt-sm-5 mt-md-0 p-0">
            <Deposite depositeAmount={this.depositeAmount} />
            <CreateTransfer createTransfer={this.createTransfer} />
          </Col>
        </Row>
        {transfersLength ? (
          <Row>
            <Approve
              walletInstance={walletInstance}
              accounts={accounts}
              transfersLength={transfersLength}
              updateWalletBalance={this.updateWalletBalance}
            />
          </Row>
        ) : null}
      </Container>
    );
  }
}

export default Wallet;
