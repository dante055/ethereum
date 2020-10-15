import React, { Component } from 'react';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';

export class CreateWallet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      approvers: '',
      quorum: '',
      isCreatingWallet: false,
      isSubmit: false,
      isWalletCreated: false,
      walletAddress: '',
    };

    this.textAreaRef = React.createRef();
  }

  createMultisigWallet = async (approvers, quorum) => {
    const { factoryContract, accounts } = this.props;
    try {
      await factoryContract.methods
        .createMultiSigWallet(approvers, quorum)
        .send({ from: accounts[0] });
      const address = await await factoryContract.methods
        .getAllWalletAddress()
        .call();
      this.setState({ walletAddress: address[address.length - 1] });
      // await this.props.updateAddress();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    let approvers = this.state.approvers
      .replace(/(\r\n|\n|\r| +)/gm, '')
      .split(','); // to remove the empty spaces, line breaks and conver it in a array
    let quorum = parseInt(this.state.quorum);
    approvers = approvers.filter(Boolean); // to remove the blank entries
    try {
      this.setState({ isCreatingWallet: true, isSubmit: false });
      await this.createMultisigWallet(approvers, quorum);
      this.setState({ isWalletCreated: true });
    } catch (error) {
      console.log(error);
      this.setState({ isWalletCreated: false });
    } finally {
      this.setState({
        isCreatingWallet: false,
        isSubmit: true,
      });
    }
  };

  textAreaFocus = () => {
    const $textArea = this.textAreaRef.current;
    const savedValue = $textArea.value;
    $textArea.baseScrollHeight = $textArea.scrollHeight;
    $textArea.value = savedValue;
  };

  teaxtAreaOnInput = () => {
    const $textArea = this.textAreaRef.current;
    const minRows = $textArea.getAttribute('data-min-rows') | 0;
    $textArea.rows = minRows;
    const rows = Math.floor(
      ($textArea.scrollHeight - $textArea.baseScrollHeight) / 20
    );
    $textArea.rows = minRows + rows;
  };

  render() {
    // console.log(this.props);
    const {
      approvers,
      quorum,
      isCreatingWallet,
      isWalletCreated,
      isSubmit,
      walletAddress,
    } = this.state;
    const alertClass = isWalletCreated ? 'success' : 'danger';
    const alertMessage = isWalletCreated
      ? `Successfully created wallet at address ${walletAddress} !!`
      : 'Something went wrong see console for more info!!';

    return (
      <Container className="mt-5">
        <Card>
          <Card.Header className="font-weight-bold">
            Create a new MutiSig Wallet
          </Card.Header>
          <Card.Body>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group controlId="formApproversAddress">
                <Form.Label>Arrovers Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="1"
                  data-min-rows="1"
                  type="text"
                  placeholder="address1, address2, address3, ..."
                  required
                  name="approvers"
                  value={approvers}
                  onChange={this.handleChange}
                  onFocus={this.textAreaFocus}
                  onInput={this.teaxtAreaOnInput}
                  ref={this.textAreaRef}
                />
              </Form.Group>

              <Form.Group controlId="formQuorum">
                <Form.Label>Quorum</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  placeholder="Quorum"
                  required
                  name="quorum"
                  value={quorum}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                disabled={isCreatingWallet}
              >
                {isCreatingWallet ? (
                  <React.Fragment>
                    <Spinner animation="border" size="sm" role="status" />
                    <span className="pl-2">Creating...</span>
                  </React.Fragment>
                ) : (
                  'Create Wallets'
                )}
              </Button>
              {isSubmit ? (
                <Alert variant={alertClass} className="mt-2">
                  {alertMessage}
                </Alert>
              ) : null}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default CreateWallet; 
