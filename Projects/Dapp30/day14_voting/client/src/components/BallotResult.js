import React, { Component } from 'react';
import { Row, Col, Card, Alert, Table } from 'react-bootstrap';

class BallotResult extends Component {
  state = {
    result: [],
    winner: '',
    isDraw: false,
    error: false,
  };
  async componentDidMount() {
    const { ballotId, contract } = this.props;
    console.log(ballotId);
    let result, winner, error;
    try {
      result = await contract.methods.result(ballotId).call();
      winner = await contract.methods.showWinner(ballotId).call();
      let isDraw;
      console.log(winner);
      if (
        winner.choiceId === '0' &&
        winner.name == '' &&
        winner.votesReceived === '0'
      ) {
        isDraw = true;
      }
      this.setState({ result, winner, isDraw });
    } catch (error) {
      console.log(error);
      this.setState({ error: true });
    }
  }

  getResult = () => {
    const { result } = this.state;
    return result.map(choice => (
      <tr key={choice.choiceId} className='font-weight-italic'>
        <td>{choice.choiceId}</td>
        <td>{choice.name}</td>
        <td>{choice.votesReceived}</td>
      </tr>
    ));
  };

  render() {
    const { isDraw, winner, error } = this.state;
    const varient = isDraw ? 'dark' : 'success';
    const alertMsg = isDraw
      ? 'No one won, the result was a draw!!'
      : `The winner has received ${winner.votesReceived} votes and his id is ${winner.choiceId} and name is ${winner.name}!`;
    return (
      <Row>
        <Col>
          <Card className='mb-3'>
            <Card.Header>Result</Card.Header>
            <Card.Body>
              {error ? (
                <Alert variant='danger'>
                  Someting went worng... see console for more info!! (Wait for
                  the creation of the next block to the see the result)
                </Alert>
              ) : (
                <React.Fragment>
                  <Alert variant={varient}>{alertMsg}</Alert>
                  <Table striped bordered hover size='sm'>
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Votes Received</th>
                      </tr>
                    </thead>
                    <tbody>{this.getResult()}</tbody>
                  </Table>
                </React.Fragment>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default BallotResult;
