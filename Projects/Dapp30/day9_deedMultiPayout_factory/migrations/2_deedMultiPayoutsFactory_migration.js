const DeedMultiPayoutsFactory = artifacts.require('DeedMultiPayoutsFactory');

module.exports = function (deployer) {
  deployer.deploy(DeedMultiPayoutsFactory);
};
