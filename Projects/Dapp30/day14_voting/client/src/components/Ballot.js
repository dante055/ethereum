import React, { Component } from 'react';
import BallotDetails from './BallotDetails';
import AdminPannel from './AdminPannel';
import BallotResult from './BallotResult';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Dropdown,
  Spinner,
} from 'react-bootstrap';

class Ballot extends Component {
  state = {
    ballotDetails: {},
    currentAddress: '',
    isVoting: false,
    isVotingClicked: false,
    hasVoted: false,
  };
  async componentDidMount() {
    if (this.props.shouldReset) {
      window.location.reload(true);
    }
    await this.setBallotDetails();
  }

  async componentDidUpdate(prevProps) {
    if (this.props.match.match.path !== prevProps.match.match.path)
      await this.setBallotDetails();
  }

  setBallotDetails = async () => {
    const { contract } = this.props;
    const ballotId = parseInt(
      this.props.match.match.path.split('/ballot/').pop()
    );
    const ballot = await contract.methods.ballots(ballotId).call();
    const choices = await contract.methods.showChoices(ballotId).call();
    const voters = await contract.methods.showVoters(ballotId).call();
    let status;
    if (!ballot.hasVotingBegin) {
      status = 0;
    } else if (
      ballot.hasVotingBegin &&
      ballot.endTime > Date.parse(new Date()) / 1000
    ) {
      status = 1;
    } else if (
      ballot.hasVotingBegin &&
      ballot.endTime <= Date.parse(new Date()) / 1000
    ) {
      status = 2;
    }

    const currentAddress = await this.props.getAccounts();

    this.setState({
      ballotDetails: {
        ballot: ballot,
        choices: choices,
        voters: voters,
        status,
      },
      currentAddress,
    });
  };

  updateVoters = async ballotId => {
    const { contract } = this.props;

    const voters = await contract.methods.showVoters(ballotId).call();
    this.setState({
      ballotDetails: { ...this.state.ballotDetails, voters: voters },
    });
  };

  vote = async choiceId => {
    const { contract } = this.props;
    const ballotId = this.state.ballotDetails.ballot.ballotId;
    const accounts = await this.props.getAccounts();
    console.log(ballotId, choiceId);
    try {
      this.setState({ isVotingClicked: false, isVoting: true });

      await contract.methods
        .vote(ballotId, choiceId)
        .send({ from: accounts[0] });
      this.setState({ hasVoted: true });
      await this.updateBallotDetails(ballotId);
    } catch (error) {
      console.log(error);
      this.setState({ hasVoted: false });
    } finally {
      this.setState({ isVotingClicked: true, isVoting: false });
    }
  };

  render() {
    const {
      ballotDetails,
      currentAddress,
      hasVoted,
      isVotingClicked,
      isVoting,
    } = this.state;
    const { admin, contract } = this.props;

    let variant, alertMsg;
    if (ballotDetails.status === 0) {
      variant = 'secondary';
      alertMsg = 'The voting for this ballot hasnt started yet!';
    } else if (ballotDetails.status === 1) {
      variant = 'warning';
      alertMsg = 'The voting for this ballot is currently open!';
    } else {
      variant = 'success';
      alertMsg = 'The voting for this ballot is finished!';
    }

    const alertClass = hasVoted ? 'success' : 'danger';
    const alertMessage = hasVoted
      ? `Your vote has successfully been recorded!!`
      : 'Something went wrong see console for more info!!';

    const ifNot = currentAddress[0] !== admin ? { span: 8, offset: 2 } : '7';

    let dropdownItems = null;
    if (ballotDetails.choices) {
      dropdownItems = ballotDetails.choices.length
        ? ballotDetails.choices.map(choice => (
            <Dropdown.Item
              key={choice._id}
              onClick={() => this.vote(choice._id)}
            >
              {choice._name} (id: {choice._id})
            </Dropdown.Item>
          ))
        : null;
    }

    return (
      <Container className='mt-5'>
        <Row>
          <Col>
            <Alert variant={variant}>{alertMsg}</Alert>
          </Col>
        </Row>

        {ballotDetails.status === 2 ? (
          <BallotResult
            ballotId={ballotDetails.ballot.ballotId}
            contract={contract}
          />
        ) : null}

        {ballotDetails.status === 1 ? (
          <Row className='mb-3'>
            <Col>
              <Card>
                <Card.Header>Vote</Card.Header>
                <Card.Body>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant='outline-info'
                      id='dropdown-basic'
                      disabled={isVoting}
                    >
                      {isVoting ? (
                        <React.Fragment>
                          <Spinner animation='border' size='sm' role='status' />
                          <span className='pl-2'>Voting...</span>
                        </React.Fragment>
                      ) : (
                        'Vote for this Ballot'
                      )}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>
                  </Dropdown>
                  {isVotingClicked ? (
                    <Alert variant={alertClass} className='mt-2'>
                      {alertMessage}
                    </Alert>
                  ) : null}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : null}

        <Row>
          <Col md={ifNot}>
            <BallotDetails ballotDetails={ballotDetails} />
          </Col>
          {currentAddress[0] === admin ? (
            <Col>
              <AdminPannel
                status={ballotDetails.status}
                ballotId={ballotDetails.ballot.ballotId}
                accounts={currentAddress}
                contract={contract}
                updateVoters={this.updateVoters}
                setBallotDetails={this.setBallotDetails}
              />
            </Col>
          ) : null}
        </Row>
      </Container>
    );
  }
}

export default Ballot;
