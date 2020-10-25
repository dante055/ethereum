import React, { Component } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Dropdown,
  ButtonGroup,
} from 'react-bootstrap';

class Create extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ballotName: this.props.ballotName,
      choices: this.props.choices,
      timeLimit: this.props.timeLimit,
      timeLimitType: this.props.timeLimitType,
    };
    this.textAreaRef = React.createRef();
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();
    let { ballotName, timeLimitType } = this.state;
    let choices = this.state.choices
      .replace(/(\r\n|\n|\r| +)/gm, '')
      .split(','); // to remove the empty spaces, line breaks and conver it in a array
    choices = choices.filter(Boolean); // to remove the blank entries
    let timeLimit = parseInt(this.state.timeLimit);

    await this.props.createBallot(
      ballotName,
      choices,
      timeLimit,
      timeLimitType
    );
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
    const { ballotName, choices, timeLimit, timeLimitType } = this.state;

    return (
      <Container className='mt-5'>
        <Card>
          <Card.Header className='font-weight-bold'>
            Create a new Ballot
          </Card.Header>
          <Card.Body>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group controlId='formBallotName'>
                <Form.Label>Ballot Name</Form.Label>
                <Form.Control
                  type='text'
                  min='1'
                  placeholder='Ballot Name'
                  required
                  name='ballotName'
                  value={ballotName}
                  onChange={this.handleChange}
                />
              </Form.Group>

              <Form.Group controlId='formChoices'>
                <Form.Label>Ballot Choices</Form.Label>
                <Form.Control
                  as='textarea'
                  rows='1'
                  data-min-rows='1'
                  type='text'
                  placeholder='choice1, choice2, choice3, ...'
                  required
                  name='choices'
                  value={choices}
                  onChange={this.handleChange}
                  onFocus={this.textAreaFocus}
                  onInput={this.teaxtAreaOnInput}
                  ref={this.textAreaRef}
                />
              </Form.Group>

              <Form.Group controlId='formTimeLimit'>
                <Form.Label>TimeLimit</Form.Label>
                <InputGroup className='mb-3'>
                  <Form.Control
                    type='number'
                    min='1'
                    placeholder={`Enter the time limit in ${timeLimitType}`}
                    required
                    name='timeLimit'
                    value={timeLimit}
                    onChange={this.handleChange}
                  />
                  <InputGroup.Append>
                    <Dropdown as={ButtonGroup}>
                      <Dropdown.Toggle
                        variant='secondary'
                        id='dropdown-basic'
                        className='p-1'
                        style={{ borderRadius: '0' }}
                      >
                        In {timeLimitType}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() =>
                            this.setState({ timeLimitType: 'Seconds' })
                          }
                        >
                          Seconds
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() =>
                            this.setState({ timeLimitType: 'Hours' })
                          }
                        >
                          Hours
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() =>
                            this.setState({ timeLimitType: 'Days' })
                          }
                        >
                          Days
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() =>
                            this.setState({ timeLimitType: 'Weeks' })
                          }
                        >
                          Weeks
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>

              <Button
                variant='primary'
                type='submit'
                disabled={this.props.isCreating}
              >
                {this.props.isCreating ? (
                  <React.Fragment>
                    <Spinner animation='border' size='sm' role='status' />
                    <span className='pl-2'>Creating...</span>
                  </React.Fragment>
                ) : (
                  'Create Ballot'
                )}
              </Button>

              {this.props.showAlert ? this.props.alert : null}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default Create;
