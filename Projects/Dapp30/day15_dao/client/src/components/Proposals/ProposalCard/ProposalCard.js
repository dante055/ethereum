import React, { useContext, useState } from 'react';
import {
  Button,
  Card,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
  Spinner,
} from 'react-bootstrap';
import Countdown from 'react-countdown';
import { Link } from 'react-router-dom';
import { ContractContext } from '../../../Context/ContractContext';
// import { getAccounts } from '../../../utiliies/contractUtils';
import AlertComponent from '../../Alert/AlertComponent';
import styles from './ProposalCard.module.css';

function ProposalCard({ proposal }) {
  const [proposalState, setProposal] = useState(proposal);
  const [votingStatus, setVotingStatus] = useState({
    isVoting: 'NO',
    hasVoted: 'HAS_NOT_CLICK_SUBMIT',
  });

  const {
    web3,
    contractObj: { contract },
    accounts,
    dispatch,
    admin,
  } = useContext(ContractContext);

  const votingEndTime = proposalState.votingEndTime * 1000; //in milli seconds
  const votingEnd = votingEndTime < Date.now() ? true : false;

  const updatedProposal = async () => {
    let newProposal = await contract.methods
      .proposals(proposalState.propsalId)
      .call();
    let currentUserHasVoted = await contract.methods
      .votes(accounts[0], proposalState.propsalId)
      .call();
    setProposal({ ...newProposal, currentUserHasVoted });
  };

  const handleClick = async () => {
    // const newAccounts = await getAccounts(web3);
    try {
      setVotingStatus({
        ...votingStatus,
        isVoting: 'YES',
        hasVoted: 'HAS_NOT_CLICK_SUBMIT',
      });
      //   if (newAccounts[0] !== accounts[0]) {
      //     dispatch({ type: 'SET_ACCOUNTS', accounts: newAccounts });
      //   }
      await contract.methods
        .vote(proposalState.propsalId)
        .send({ from: accounts[0] });
      await updatedProposal();
      setVotingStatus({
        ...votingStatus,
        isVoting: 'No',
        hasVoted: 'SUCESSFULLY_VOTED',
      });
    } catch (error) {
      setVotingStatus({
        ...votingStatus,
        isVoting: 'No',
        hasVoted: 'UNSUCESSFULL_TRY',
      });
    }
  };

  const execute = async () => {
    try {
      setVotingStatus({
        ...votingStatus,
        isVoting: 'YES',
        hasVoted: 'HAS_NOT_CLICK_SUBMIT',
      });

      await contract.methods
        .executeTransfer(proposalState.propsalId)
        .send({ from: accounts[0] });
      await updatedProposal();

      setVotingStatus({
        ...votingStatus,
        isVoting: 'No',
        hasVoted: 'SUCESSFULLY_EXECUTED',
      });
    } catch (error) {
      console.log(error);
      setVotingStatus({
        ...votingStatus,
        isVoting: 'No',
        hasVoted: 'UNSUCESSFULL',
      });
    }
  };

  return (
    <div className={styles.proposalCard}>
      <Card className={styles.proposalCard__card}>
        <Card.Header>
          <Card.Title>
            <Link to={`/proposal/${proposalState.propsalId}`}>
              {proposalState.proposalName}
            </Link>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <ListGroup>
            <ListGroupItem>
              {!votingEnd ? (
                <>
                  <Row>
                    <Col className='text-center font-weight-bold mb-2'>
                      <Countdown
                        date={votingEndTime}
                        onComplete={async () => await updatedProposal()}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col className='text-center'>
                      <Button
                        variant='outline-dark'
                        size='sm'
                        onClick={handleClick}
                        disabled={
                          proposalState.currentUserHasVoted ||
                          votingStatus.isVoting === 'YES'
                        }
                      >
                        {votingStatus.isVoting === 'YES' ? (
                          <React.Fragment>
                            <Spinner
                              animation='border'
                              size='sm'
                              role='status'
                            />
                            <span className='pl-2'>Voting...</span>
                          </React.Fragment>
                        ) : (
                          'Vote'
                        )}
                      </Button>
                    </Col>
                  </Row>
                  {votingStatus.hasVoted === 'SUCESSFULLY_VOTED' ? (
                    <AlertComponent
                      variant='success'
                      msg='Successfully voted!!'
                    />
                  ) : votingStatus.hasVoted === 'UNSUCESSFULL_TRY' ? (
                    <AlertComponent
                      variant='danger'
                      msg='Something went wrong!!'
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <span>Voting for this proposal has already ended!!</span>
                  {admin === accounts[0] ? (
                    <>
                      <Row>
                        <Col className='text-center'>
                          <Button
                            variant='outline-dark'
                            size='sm'
                            onClick={execute}
                            disabled={
                              proposalState.executed ||
                              votingStatus.isVoting === 'YES'
                            }
                          >
                            {votingStatus.isVoting === 'YES' ? (
                              <React.Fragment>
                                <Spinner
                                  animation='border'
                                  size='sm'
                                  role='status'
                                />
                                <span className='pl-2'>Executing...</span>
                              </React.Fragment>
                            ) : (
                              'Execute'
                            )}
                          </Button>
                        </Col>
                      </Row>
                      {votingStatus.hasVoted === 'SUCESSFULLY_EXECUTED' ? (
                        <AlertComponent
                          variant='success'
                          msg='Successfully executed!!'
                        />
                      ) : votingStatus.hasVoted === 'UNSUCESSFULL' ? (
                        <AlertComponent
                          variant='danger'
                          msg='Something went wrong!!'
                        />
                      ) : null}
                    </>
                  ) : null}
                </>
              )}
            </ListGroupItem>
          </ListGroup>
        </Card.Body>
        <ListGroup>
          <ListGroupItem>
            <Card.Title>Proposal Details</Card.Title>
            {!votingEnd ? (
              <>
                <Row>
                  <Col sm={12}>
                    <span className='font-weight-bold'>Amount</span>
                  </Col>
                  <Col>{proposalState.amount}</Col>
                </Row>
                <Row className='mt-2'>
                  <Col sm={12}>
                    <span className='font-weight-bold'>Recipient</span>
                  </Col>
                  <Col className={styles.proposalCard__recipient}>
                    {proposalState.recipient}
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <Row>
                  <Col sm={9}>
                    <span className='font-weight-bold'>Proposal Passed</span>
                  </Col>
                  <Col>{proposalState.proposalPassed ? 'Yes' : 'No'}</Col>
                </Row>
                <Row className='mt-2'>
                  <Col sm={9}>
                    <span className='font-weight-bold'>Proposal Executed</span>
                  </Col>
                  <Col>{proposalState.executed ? 'Yes' : 'No'}</Col>
                </Row>
              </>
            )}
            <Row className='mt-2'>
              <Col sm={12}>
                <span className='font-weight-bold'>VotesRecievedPerShare</span>
              </Col>
              <Col>{proposalState.votesRecievedPerShare}</Col>
            </Row>
          </ListGroupItem>
        </ListGroup>
      </Card>
    </div>
  );
}

export default ProposalCard;
