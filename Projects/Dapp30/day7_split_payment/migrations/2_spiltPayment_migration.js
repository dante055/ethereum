const SplitPayment = artifacts.require('SplitPayment');

module.exports = function (deployer) {
  deployer.deploy(SplitPayment);
};
