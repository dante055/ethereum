const Deed = artifacts.require('Deed');

module.exports = function (deployer, _network, accounts) {
  const amount = web3.utils.toWei('2', 'ether');
  const earliestTransferDate = new Date('2020-7-25');
  const unixTimestame = Date.parse(earliestTransferDate) / 1000;

  deployer.deploy(Deed, accounts[1], accounts[2], unixTimestame, {
    value: amount,
    from: accounts[0],
  });
};
