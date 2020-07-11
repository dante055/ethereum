import React from 'react';

const Header = ({ address }) => {
  return (
    <div id="page-header" className="row">
      <div className="col-sm-12">
        <h1>Ethereum ToDo List App</h1>
        <h2>Address: {address}</h2>
      </div>
    </div>
  );
};

export default Header;
