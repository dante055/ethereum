import React, { useEffect, useState } from 'react';
import { getWeb3, getWallet } from './utils.js';
import Header from './Header.js';
import NewTransfer from './NewTransfer.js';
import TransferList from './TransferList.js';
import './App.css';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [approvers, setApprovers] = useState([]);
  const [quorum, setQuorum] = useState(undefined);
  const [transfers, setTransfers] = useState([]);
  const [balance, setBalance] = useState(undefined);

  // componentDidMount, cDU, cDUM
  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const wallet = await getWallet(web3);
      const accounts = await web3.eth.getAccounts();
      const approvers = await wallet.methods.getApprovers().call();
      const quorum = await wallet.methods.quorum().call();
      const transfers = await wallet.methods.getTransfers().call();
      const balance = await web3.eth.getBalance(wallet._address);

      setWeb3(web3);
      setWallet(wallet);
      setAccounts(accounts);
      setApprovers(approvers);
      setQuorum(quorum);
      setTransfers(transfers);
      setBalance(balance);
    };
    init();
  }, []);

  // const f = async () => {
  //   console.log(await getWeb3());
  // };

  // f();

  const createTransfer = async (transfer) => {
    const accounts = await web3.eth.getAccounts();
    setAccounts(accounts);
    await wallet.methods
      .createTransfer(transfer.amount, transfer.to)
      .send({ from: accounts[0], gas: 1000000 });
    const transfers = await wallet.methods.getTransfers().call();
    setTransfers(transfers);
  };

  const approveTransfer = async (transferId) => {
    const accounts = await web3.eth.getAccounts();
    setAccounts(accounts);
    await wallet.methods
      .approveTransfer(transferId)
      .send({ from: accounts[0], gas: 1000000 });
    const transfers = await wallet.methods.getTransfers().call();

    const balance = await web3.eth.getBalance(wallet._address);
    setTransfers(transfers);
    setBalance(balance);
  };

  if (
    typeof web3 === 'undefined' ||
    typeof accounts === 'undefined' ||
    typeof wallet === 'undefined' ||
    approvers.length === 0 ||
    typeof quorum === 'undefined'
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1 className="Heading">Multisig Dapp</h1>
      <Header approvers={approvers} quorum={quorum} balance={balance} />
      <NewTransfer createTransfer={createTransfer} />
      <TransferList transfers={transfers} approveTransfer={approveTransfer} />
    </div>
  );
}

export default App;
