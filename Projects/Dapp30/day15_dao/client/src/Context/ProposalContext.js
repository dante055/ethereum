import React, { useReducer, createContext } from 'react';

const initialProposal = [];
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROPOSALS':
      return action.proposals;
    case 'UPDATE_PROPOSAL':
      return (state[action.proposalId] = action.proposal);
    default:
      return state;
  }
};

const ProposalContext = createContext();
const { Provider } = ProposalContext;

const ProposalProvider = ({ children }) => {
  const [proposals, proposalsDispatch] = useReducer(reducer, initialProposal);

  return (
    <Provider value={{ proposals, proposalsDispatch }}>{children}</Provider>
  );
};

export { ProposalContext, ProposalProvider };
