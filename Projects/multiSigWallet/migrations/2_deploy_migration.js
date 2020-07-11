const MultiSigWallet = artifacts.require('MultiSigWallet');

module.exports = async function (deployer, _network, accounts) {
  // contract is deployed
  await deployer.deploy(
    MultiSigWallet,
    [accounts[0], accounts[1], accounts[2]],
    2
  );

  // to interact with deployed contract
  const multiSigWallet = await MultiSigWallet.deployed();
  await web3.eth.sendTransaction({
    from: accounts[0],
    to: multiSigWallet.address,
    value: 1000,
  });
};

// truffle migration gives a instance of web3 and accounts of ganache
// _ network knowing which network u are deployed to
