const DeedMultiPayouts = artifacts.require('DeedMultiPayouts');

module.exports = function (deployer, _network, accounts) {
  const amountDeposited = web3.utils.toWei('8', 'ether');
  const payouts = 8;
  const interval = 2; // after 2 seconds
  const earliestTransferDate = new Date(); // now
  const unixTimestamp = Date.parse(earliestTransferDate) / 1000;
  deployer.deploy(
    DeedMultiPayouts,
    accounts[1],
    accounts[2],
    unixTimestamp,
    payouts,
    interval,
    { value: amountDeposited, from: accounts[0] }
  );
};

