import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Alert } from 'react-bootstrap';

class Ballots extends Component {
  componentDidMount() {
    if (this.props.shouldReset) {
      window.location.reload(true);
    }
  }

  balletDetiailJsx = ballotsDetail => {
    return ballotsDetail.map(ballot => {
      let variant;
      let title;
      if (ballot.ballotStatus == 0) {
        variant = 'secondary ';
        title = 'Voting has not been open for this ballot!';
      } else if (
        ballot.ballotStatus == 1 &&
        ballot.endTime > Date.parse(new Date()) / 1000
      ) {
        variant = 'warning';
        title = 'Voting is open for this ballot1';
      } else if (ballot.endTime <= Date.parse(new Date()) / 1000) {
        variant = 'success';
        title = 'Voting has been finished for this ballot!';
      }

      return (
        <React.Fragment key={ballot.ballotId}>
          <Link to={`/ballot/${ballot.ballotId}`} title={title}>
            <Alert variant={variant}>{ballot.name}</Alert>
          </Link>
        </React.Fragment>
      );
    });
  };

  render() {
    const { ballotsDetail } = this.props;
    return (
      <Container className='mt-5'>
        <Card>
          {ballotsDetail.length ? (
            <React.Fragment>
              <Card.Header className='font-weight-bold '>
                Currently Present Ballots
              </Card.Header>
              <Card.Body>{this.balletDetiailJsx(ballotsDetail)}</Card.Body>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Alert variant='danger'>Currently u dont have any wallet.</Alert>
              <Card.Body>
                <Link to='/create'>
                  <Button variant='primary'>Create a Wallet</Button>
                </Link>
              </Card.Body>
            </React.Fragment>
          )}
        </Card>
      </Container>
    );
  }
}

export default Ballots;
