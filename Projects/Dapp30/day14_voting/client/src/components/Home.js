import React, { Component } from 'react';
import Ballots from './Ballots';
import { Container, Row, Col, Card } from 'react-bootstrap';

class Home extends Component {
  render() {
    const { contractAddress, admin, ballotsDetail } = this.props;
    return (
      <React.Fragment>
        <Container className='mt-5'>
          <Card>
            <Card.Header>
              <Row>
                <Col className='font-weight-bold'>Contract Address</Col>
                <Col className='font-italic'>{contractAddress}</Col>
              </Row>
              <Row>
                <Col className='font-weight-bold'>Admin</Col>
                <Col className='font-italic'>{admin}</Col>
              </Row>
            </Card.Header>
          </Card>
        </Container>

        <Ballots ballotsDetail={ballotsDetail} />
      </React.Fragment>
    );
  }
}

export default Home;
