import React from 'react';
import { ContractProvider } from './Context/ContractContext';
import { ProposalProvider } from './Context/ProposalContext';
import { Load } from './components/index';

function App() {
  // console.log('---------App-----------');

  return (
    <ContractProvider>
      <ProposalProvider>
        <Load />
      </ProposalProvider>
    </ContractProvider>
  );
}

export default App;
