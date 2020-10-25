import React, { useContext, useState, useEffect } from 'react';
import { ContractContext } from '../../Context/ContractContext';
import { ProposalContext } from '../../Context/ProposalContext';
import { Jumbotron, Button, Row, Col, Form, Spinner } from 'react-bootstrap';
import Countdown from 'react-countdown';
import AlertComponent from '../Alert/AlertComponent';
import styles from './Home.module.css';

function Home() {
  const {
    contractObj: { contract, contractAddress },
    accounts,
  } = useContext(ContractContext);
  const { proposals } = useContext(ProposalContext);

  const [contractDetails, setContractDetails] = useState({
    admin: '',
    contributeEndTime: 0,
    totalSharesBought: '',
    quorum: '',
  });
  const [amount, setAmount] = useState('');
  const [investingStatus, setInvestngStatus] = useState({
    isInvesting: false,
    hasInvested: 'HAS_NOT_CLICK_SUBMIT',
  });
  const { isInvesting, hasInvested } = investingStatus;

  const investmentEnd =
    contractDetails.contributeEndTime < Date.now() ? true : false;

  useEffect(() => {
    (async () => {
      try {
        const admin = await contract.methods.admin().call();
        let contributeEndTime = await contract.methods
          .contributeEndTime()
          .call();
        contributeEndTime = contributeEndTime * 1000;
        const totalSharesBought = await contract.methods.totalShares().call();
        const quorum = await contract.methods.quorum().call();

        setContractDetails({
          admin,
          contributeEndTime,
          totalSharesBought,
          quorum,
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const handleChange = e => {
    setAmount(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log(contract);
    try {
      setInvestngStatus({
        isInvesting: true,
        hasInvested: 'HAS_NOT_CLICK_SUBMIT',
      });
      await contract.methods
        .contribute()
        .send({ value: amount, from: accounts[0] });
      const totalSharesBought = await contract.methods.totalShares().call();
      setContractDetails({ ...contractDetails, totalSharesBought });
      setInvestngStatus({
        isInvesting: false,
        hasInvested: 'SUCCESSFULLY_INVESTED',
      });
    } catch (error) {
      console.log(error);
      setInvestngStatus({
        isInvesting: false,
        hasInvested: 'USUCCESSFULL',
      });
    }
  };

  return contractDetails.contributeEndTime ? (
    <Jumbotron className='p-5'>
      <Row className='text-left'>
        <Col sm={4}>Contract Address</Col>
        <Col>{contractAddress}</Col>
      </Row>
      <Row className='text-left'>
        <Col sm={4}>Contract Owner</Col>
        <Col>{contractDetails.admin}</Col>
      </Row>
      <Row className='mt-3'>
        <Col sm={7}>
          <Row>
            <Col sm={12} className={styles.home_lable}>
              Investment Countdown
            </Col>
            <Col className={styles.home_coumter}>
              <Countdown date={contractDetails.contributeEndTime} />
            </Col>
          </Row>
          <Row className=' mt-3'>
            <Col sm={12} className={styles.home_lable}>
              Total Shares Sold
            </Col>
            <Col className={styles.home_shares}>
              {contractDetails.totalSharesBought}
            </Col>
          </Row>
        </Col>
        <div className={styles.home__vertical}></div>
        <Col className='d-flex align-items-center'>
          <Row className='text-left'>
            {investmentEnd ? (
              <Col className={styles.home__endMsg}>
                The investment period has already ended!!
              </Col>
            ) : (
              <Form onSubmit={handleSubmit}>
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
                <Button variant='primary' type='submit' disabled={isInvesting}>
                  {isInvesting ? (
                    <React.Fragment>
                      <Spinner animation='border' size='sm' role='status' />
                      <span className='pl-2'>Investing...</span>
                    </React.Fragment>
                  ) : (
                    'Invest'
                  )}
                </Button>

                {hasInvested === 'SUCCESSFULLY_INVESTED' ? (
                  <AlertComponent
                    variant='success'
                    msg={`You have successfully baught ${amount} shares!!`}
                  />
                ) : hasInvested === 'USUCCESSFULL' ? (
                  <AlertComponent
                    variant='danger'
                    msg='Something went wrong see console for more info!!'
                  />
                ) : null}
              </Form>
            )}
          </Row>
        </Col>
      </Row>
    </Jumbotron>
  ) : null;
}

export default Home;
