import React, { useReducer, createContext } from 'react';

const initialState = {
  loading: true,
  web3: undefined,
  contractObj: undefined,
  accounts: [],
  admin: '',
  error: {},
};
const reducer = (state, action) => {
  console.log('inside reducer');
  switch (action.type) {
    case 'LOADING_SUCCESSFULL':
      return {
        loading: false,
        web3: action.web3,
        contractObj: action.contract,
        accounts: action.accounts,
        admin: action.admin,
        error: {},
      };
    case 'LOADING_UNSUCCESSFULL':
      return {
        loading: false,
        web3: action.web3,
        contractObj: action.contract,
        accounts: [],
        admin: '',
        error: {
          heading: action.error.name,
          msg: action.error.message,
        },
      };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.accounts };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const ContractContext = createContext();
const { Provider } = ContractContext;

const ContractProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <Provider value={{ ...state, dispatch }}>{children}</Provider>;
};

export { ContractContext, ContractProvider };
