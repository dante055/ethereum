const DeedFactory = artifacts.require('DeedFactory');

module.exports = function (deployer) {
  deployer.deploy(DeedFactory);
};
