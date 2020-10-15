import React, { Component } from 'react';
import {
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap';
import styles from '../css/walletDetils.module.css';

class CreateTransfer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      to: '',
      amount: '',
      isCreatingTransfer: false,
      isCreateClick: false,
      isTansferCreated: false,
    };
  }

  inputHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  submitHandler = async (e) => {
    e.preventDefault();
    const { to, amount } = this.state;
    try {
      this.setState({ isCreateClick: false, isCreatingTransfer: true });
      await this.props.createTransfer(to, parseInt(amount));
      this.setState({ isTansferCreated: true });
    } catch (error) {
      console.error(error);
      this.setState({ isTansferCreated: false });
    } finally {
      this.setState({ isCreateClick: true, isCreatingTransfer: false });
    }
  };

  render() {
    const {
      to,
      amount,
      isCreateClick,
      isCreatingTransfer,
      isTansferCreated,
    } = this.state;
    const alertClass = isTansferCreated ? 'success' : 'danger';
    const alertMessage = isTansferCreated
      ? `Successfully create trafer for ${amount} wei to ${to} address!!`
      : 'Something went wrong see console for more info!!';

    return (
      <Col sm="12">
        <Card>
          <Card.Header className={styles.cardHeading}>
            Create Transfer
          </Card.Header>
          <Card.Body>
            <Form onSubmit={this.submitHandler}>
              <Form.Group controlId="formBasicRecipient">
                <Form.Label>Recipient address</Form.Label>
                <Form.Control
                  type="Text"
                  name="to"
                  value={to}
                  onChange={this.inputHandler}
                  placeholder="Enter Recipient address"
                />
              </Form.Group>

              <Form.Group controlId="formBasicAmount">
                <Form.Label>Amount</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={amount}
                    onChange={this.inputHandler}
                    placeholder="Enter Amount"
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>wei</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
              <Button
                variant="secondary"
                type="submit"
                disabled={isCreatingTransfer}
              >
                {isCreatingTransfer ? (
                  <React.Fragment>
                    <Spinner animation="border" size="sm" role="status" />
                    <span className="pl-2">Creating...</span>
                  </React.Fragment>
                ) : (
                  'Create Transfer'
                )}
              </Button>
              {isCreateClick ? (
                <Alert variant={alertClass} className="mt-2">
                  {alertMessage}
                </Alert>
              ) : null}
            </Form>
          </Card.Body>
        </Card>
      </Col>
    );
  }
}

export default CreateTransfer;
