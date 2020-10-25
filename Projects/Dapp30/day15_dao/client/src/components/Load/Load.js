import React, { useContext, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ContractContext } from '../../Context/ContractContext';
import { ProposalContext } from '../../Context/ProposalContext';
import {
  getAccounts,
  getContract,
  getWeb3,
} from '../../utiliies/contractUtils';
import { AlertComponent } from '../index';
import { Navigation, Home, Create, Proposals, Proposal } from '../index';
// import CircularJSON from 'circular-json';

function Load() {
  const { loading, error, contractObj, accounts, dispatch } = useContext(
    ContractContext
  );
  const { proposalsDispatch } = useContext(ProposalContext);

  useEffect(() => {
    (async () => {
      try {
        // console.log('---------UseEfect: contract loading-----------');
        const web3 = await getWeb3();
        // let web3;
        // await getWeb3().then(response => {
        //   web3 = response;
        //   console.log(CircularJSON.stringify(response));
        // });
        const contract = await getContract(web3);
        const accounts = await getAccounts(web3);
        const admin = await contract.contract.methods.admin().call();
        dispatch({
          type: 'LOADING_SUCCESSFULL',
          web3: web3,
          contract: contract,
          accounts: accounts,
          admin: admin,
        });
      } catch (error) {
        console.error(error);
        // dispatch({ type: 'LOADING_UNSUCCESSFULL', error: error });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (contractObj?.contract) {
        try {
          const { contract } = contractObj;
          const totalProposals = await contract.methods
            .nextProposalIds()
            .call();
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
        } catch (error) {
          console.log(error);
        }
      }
    })();
  }, [contractObj]);

  // console.log('---------Load-----------');

  return (
    <>
      {loading ? (
        <div className='d-flex justify-content-center'>
          <h1 className='mr-2'>Loading</h1>
          <Spinner className='mt-2' animation='border' />
        </div>
      ) : error?.heading ? (
        <AlertComponent variant='danger' {...error} />
      ) : (
        <Router>
          <Navigation />
          <Container className='mt-5 text-center'>
            <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/create' component={Create} />
              <Route path='/proposals' component={Proposals} />
              <Route path='/proposal/:id' component={Proposal} />
              <Route
                component={() => (
                  <AlertComponent
                    variant='danger'
                    heading='Erro: 404'
                    msg='Page not found!!'
                  />
                )}
              />
            </Switch>
          </Container>
        </Router>
      )}
    </>
  );
}

export default Load;
