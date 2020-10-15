import React, { PureComponent } from 'react';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';
import styles from '../css/walletDetils.module.css';

class WalletDetails extends PureComponent {
  listItem = (label, value) => {
    return (
      <ListGroup.Item>
        <Row>
          <Col className={styles.colLabel}>{label}</Col>
          <Col className={styles.colDetail} sm="12">
            {value}
          </Col>
        </Row>
      </ListGroup.Item>
    );
  };

  render() {
    const {
      walletAddress,
      walletOwner,
      walletBalance,
      approvers,
      quorum,
      transfers,
    } = this.props;
    const approversString = approvers.join(', ');
    return (
      <Card>
        <Card.Header className={styles.cardHeading}>Wallet Details</Card.Header>
        <Card className="m-2">
          <ListGroup variant="flush">
            {this.listItem('Wallet Address', walletAddress)}
            {this.listItem('Wallet Owner', walletOwner)}
            {this.listItem('Wallet Balance', walletBalance)}
            {this.listItem('Approvers', approversString)  }
            {this.listItem('Quorum', quorum)}
            {this.listItem('Transfers', transfers)}
          </ListGroup>
        </Card>
      </Card>
    );
  }
}

export default WalletDetails;
