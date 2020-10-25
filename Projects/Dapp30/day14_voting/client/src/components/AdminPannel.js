import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
} from 'react-bootstrap';

class AdminPannel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      voters: '',
      isVoterAdded: false,
      isAddClick: false,
      isAdding: false,
      isOpening: false,
      isOpenVotingClicked: false,
      isOpened: false,
    };

    this.textAreaRef = React.createRef();
  }
  handleChange = e => {
    this.setState({ voters: e.target.value });
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

  handleSubmit = async e => {
    e.preventDefault();
    const { contract, ballotId, accounts } = this.props;
    let voters = this.state.voters.replace(/(\r\n|\n|\r| +)/gm, '').split(',');
    voters = voters.filter(Boolean);
    try {
      this.setState({ isAddClick: false, isAdding: true });

      await contract.methods
        .addVoters(ballotId, voters)
        .send({ from: accounts[0] });
      this.setState({ isVoterAdded: true });
      await this.props.updateVoters(ballotId);
    } catch (error) {
      console.log(error);
      this.setState({ isVoterAdded: false });
    } finally {
      this.setState({ isAddClick: true, isAdding: false });
    }
  };

  openVoting = async () => {
    const { contract, ballotId, accounts } = this.props;
    try {
      this.setState({ isOpenVotingClicked: false, isOpening: true });
      await contract.methods.beginVoting(ballotId).send({ from: accounts[0] });
      this.setState({ isOpened: true });
      await this.props.setBallotDetails();
    } catch (error) {
      console.log(error);
      this.setState({ isOpened: false });
    } finally {
      this.setState({ isOpenVotingClicked: true, isOpening: false });
    }
  };

  render() {
    const { status } = this.props;
    const {
      voters,
      isVoterAdded,
      isAddClick,
      isAdding,
      isOpenVotingClicked,
      isOpening,
      isOpened,
    } = this.state;
    const isDisable = status === 0 ? false : true;
    const buttonTitle =
      status === 0
        ? 'Begin the voting!'
        : status === 1
        ? 'The voting has already started!'
        : 'The voting has already finished!';
    const isVotingFinished = status === 2 ? true : false;
    const isVotingFinishedTitle =
      status === 2 ? 'The voting has already finished!' : null;

    const alertClass = isVoterAdded ? 'success' : 'danger';
    const alertMessage = isVoterAdded
      ? `Successfully added voters in the ballot!!`
      : 'Something went wrong see console for more info!!';

    const alertClass1 = isOpened ? 'success' : 'danger';
    const alertMessage1 = isOpened
      ? `Successfully open the voting!!`
      : 'Something went wrong see console for more info!!';

    return (
      <Card style={{ borderRadius: '0' }} title={isVotingFinishedTitle}>
        <Card.Header>Admin Pannel</Card.Header>
        <Card.Body>
          <div className='text-center'>
            <Button
              variant='dark'
              style={{ borderRadius: '50%' }}
              title={buttonTitle}
              disabled={isDisable || isOpening}
              onClick={this.openVoting}
            >
              {isOpening ? (
                <React.Fragment>
                  <Spinner animation='border' size='sm' role='status' />
                  <span className='pl-2'></span>
                </React.Fragment>
              ) : (
                'Open Voting'
              )}
            </Button>
            {isOpenVotingClicked ? (
              <Alert variant={alertClass1} className='mt-2'>
                {alertMessage1}
              </Alert>
            ) : null}
          </div>
          <hr />
          <Row>
            <Col>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group controlId='formChoices'>
                  <Form.Label>Add voters</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows='1'
                    data-min-rows='1'
                    type='text'
                    placeholder='address1, address2, address3, ...'
                    required
                    value={voters}
                    onChange={this.handleChange}
                    onFocus={this.textAreaFocus}
                    onInput={this.teaxtAreaOnInput}
                    ref={this.textAreaRef}
                    readOnly={isVotingFinished}
                  />
                </Form.Group>
                <Button
                  variant='primary'
                  type='submit'
                  disabled={isVotingFinished || isAdding}
                >
                  {isAdding ? (
                    <React.Fragment>
                      <Spinner animation='border' size='sm' role='status' />
                      <span className='pl-2'>Adding...</span>
                    </React.Fragment>
                  ) : (
                    'Add Voters'
                  )}
                </Button>
                {isAddClick ? (
                  <Alert variant={alertClass} className='mt-2'>
                    {alertMessage}
                  </Alert>
                ) : null}
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  }
}

export default AdminPannel;
