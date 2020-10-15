import React, { Component } from 'react';
import {
  Col,
  Card,
  InputGroup,
  FormControl,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap';
import styles from '../css/walletDetils.module.css';

class Deposite extends Component {
  constructor(props) {
    super(props);

    this.state = {
      amount: '',
      isDepositing: false,
      isDepositedClick: false,
      isDeposited: false,
    };
  }

  inputChange = (e) => {
    this.setState({ amount: e.target.value });
  };

  deposit = async () => {
    const { amount } = this.state;
    try {
      this.setState({ isDepositedClick: false, isDepositing: true });
      await this.props.depositeAmount(amount);
      this.setState({ isDeposited: true });
    } catch (error) {
      console.error(error);
      this.setState({ isDeposited: false });
    } finally {
      this.setState({ isDepositedClick: true, isDepositing: false });
    }
  };
  render() {
    const { amount, isDeposited, isDepositedClick, isDepositing } = this.state;
    const alertClass = isDeposited ? 'success' : 'danger';
    const alertMessage = isDeposited
      ? `Successfully deposited ${amount} wei !!`
      : 'Something went wrong see console for more info!!';

    return (
      <Col sm="12" className="mb-4">
        <Card>
          <Card.Header className={styles.cardHeading}>Deposite</Card.Header>
          <Card.Body>
            <InputGroup>
              <FormControl
                value={amount}
                onChange={this.inputChange}
                placeholder="Enter Amount"
              />
              <InputGroup.Append>
                <InputGroup.Text>wei</InputGroup.Text>
                <Button
                  variant="secondary"
                  onClick={this.deposit}
                  disabled={isDepositing}
                >
                  {isDepositing ? (
                    <React.Fragment>
                      <Spinner animation="border" size="sm" role="status" />
                      <span className="pl-2">Depositing...</span>
                    </React.Fragment>
                  ) : (
                    'Deposite'
                  )}
                </Button>
              </InputGroup.Append>
            </InputGroup>
            {isDepositedClick ? (
              <Alert variant={alertClass} className="mt-2">
                {alertMessage}
              </Alert>
            ) : null}
          </Card.Body>
        </Card>
      </Col>
    );
  }
}

export default Deposite;
