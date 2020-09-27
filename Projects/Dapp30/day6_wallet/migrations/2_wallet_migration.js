const Wallet = artifacts.require('Wallet');

module.exports = (deployer) => {
  deployer.deploy(Wallet);
};
