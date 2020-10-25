import React, { useContext } from 'react';
import { ProposalContext } from '../../Context/ProposalContext';
import ProposalCard from './ProposalCard/ProposalCard';
import styles from './Proposals.module.css';
import { CardDeck } from 'react-bootstrap';

function Proposals() {
  const { proposals } = useContext(ProposalContext);
  return (
    <div className={styles.proposal}>
      <h1>Proposals</h1>
      <CardDeck className={styles.proposals__container}>
        {proposals.length
          ? proposals.map(proposal => (
              <ProposalCard key={proposal.propsalId} proposal={proposal} />
            ))
          : null}
      </CardDeck>
    </div>
  );
}

export default Proposals;
