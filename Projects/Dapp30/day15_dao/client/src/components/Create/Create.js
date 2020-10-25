import React, { useState, useContext } from 'react';
import { Container, Card, Form, Button, Spinner, Row } from 'react-bootstrap';
import AlertComponent from '../Alert/AlertComponent';
import { ContractContext } from '../../Context/ContractContext';
import { ProposalContext } from '../../Context/ProposalContext';

function Create() {
  const {
    contractObj: { contract },
    accounts,
  } = useContext(ContractContext);
  const { proposalsDispatch } = useContext(ProposalContext);

  const [input, setInput] = useState({
    proposalName: '',
    amount: '',
    recipient: '',
  });
  const [creatingStatus, setCreatingStatus] = useState({
    isCreating: false,
    hasCreated: 'HAS_NOT_CLICK_SUBMIT',
  });

  const { proposalName, amount, recipient } = input;
  const { isCreating, hasCreated } = creatingStatus;

  const handleChange = e => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setCreatingStatus({
        isCreating: true,
        hasCreated: 'HAS_NOT_CLICK_SUBMIT',
      });

      await contract.methods
        .createProposal(proposalName, amount, recipient)
        .send({ from: accounts[0] });

      const totalProposals = await contract.methods.nextProposalIds().call();
      const tempProposals = [];
      for (let id = 0; id < totalProposals; id++) {
        let proposal = await contract.methods.proposals(id).call();
        let currentUserHasVoted = await contract.methods
          .votes(accounts[0], proposal.propsalId)
          .call();
        tempProposals.push({ ...proposal, currentUserHasVoted });
      }
      proposalsDispatch({
        type: 'SET_PROPOSALS',
        proposals: tempProposals,
      });

      setCreatingStatus({
        isCreating: false,
        hasCreated: 'SUCESSFULLY_CREATED',
      });
    } catch (error) {
      console.log(error);
      setCreatingStatus({
        isCreating: false,
        hasCreated: 'UNSUCESSFULL_TRY',
      });
    }
  };

  return (
    <Container className='mt-5 text-left'>
      <Card>
        <Card.Header className='font-weight-bold'>
          Create a new Proposal
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Proposal Name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Proposal Name'
                required
                name='proposalName'
                value={proposalName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type='number'
                min='1'
                placeholder='Amount in wei'
                required
                name='amount'
                value={amount}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Reciepient</Form.Label>
              <Form.Control
                type='text'
                placeholder='recipient address'
                required
                name='recipient'
                value={recipient}
                onChange={handleChange}
              />
            </Form.Group>

            <Button variant='primary' type='submit' disabled={isCreating}>
              {isCreating ? (
                <React.Fragment>
                  <Spinner animation='border' size='sm' role='status' />
                  <span className='pl-2'>Creating...</span>
                </React.Fragment>
              ) : (
                'Create Proposal'
              )}
            </Button>

            {hasCreated === 'SUCESSFULLY_CREATED' ? (
              <AlertComponent
                variant='success'
                msg='Successfully created a new proposal !!'
              />
            ) : hasCreated === 'UNSUCESSFULL_TRY' ? (
              <AlertComponent
                variant='danger'
                msg='Something went wrong see console for more info!!'
              />
            ) : null}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Create;
