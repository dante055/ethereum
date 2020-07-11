import React from 'react';

const Header = ({ approvers, quorum, balance }) => {
  return (
    <div>
      <ul>
        <li>Approvers: {approvers.join(', ')}</li>
        <li>quorum: {quorum}</li>
        <li>balance: {balance}</li>
      </ul>
    </div>
  );
};

export default Header;
