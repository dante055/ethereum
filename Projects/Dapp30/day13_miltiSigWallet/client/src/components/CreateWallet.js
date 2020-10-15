import React, { Component } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';

export class CreateWallet extends Component {
  constructor(props) {
    super(props);

    this.state = {
      approvers: this.props.approversInput,
      quorum: this.props.quorumInput,
    };

    this.textAreaRef = React.createRef();
  }

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

    await this.props.createMultisigWallet(approvers, quorum);
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
    console.log('child');
    const { approvers, quorum } = this.state;

    return (
      <Container className='mt-5'>
        <Card>
          <Card.Header className='font-weight-bold'>
            Create a new MutiSig Wallet
          </Card.Header>
          <Card.Body>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group controlId='formApproversAddress'>
                <Form.Label>Approvers Address</Form.Label>
                <Form.Control
                  as='textarea'
                  rows='1'
                  data-min-rows='1'
                  type='text'
                  placeholder='address1, address2, address3, ...'
                  required
                  name='approvers'
                  value={approvers}
                  onChange={this.handleChange}
                  onFocus={this.textAreaFocus}
                  onInput={this.teaxtAreaOnInput}
                  ref={this.textAreaRef}
                />
              </Form.Group>

              <Form.Group controlId='formQuorum'>
                <Form.Label>Quorum</Form.Label>
                <Form.Control
                  type='number'
                  min='1'
                  placeholder='Quorum'
                  required
                  name='quorum'
                  value={quorum}
                  onChange={this.handleChange}
                />
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
                  'Create Wallets'
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

export default CreateWallet;
