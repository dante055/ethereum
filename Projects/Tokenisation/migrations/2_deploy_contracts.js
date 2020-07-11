var MyToken = artifacts.require('MyToken.sol');
var MyTokenSale = artifacts.require('MyTokenSale');
var KycContract = artifacts.require('KycContract');
require('dotenv').config({ path: '../.env' }); // it will put the env in the process.env

module.exports = async function (deployer) {
  let accounts = await web3.eth.getAccounts();

  await deployer.deploy(MyToken, process.env.INITIAL_TOKENS);
  await deployer.deploy(KycContract);
  await deployer.deploy(
    MyTokenSale,
    1,
    accounts[0],
    MyToken.address,
    KycContract.address
  );

  let instance = await MyToken.deployed();
  await instance.transfer(MyTokenSale.address, process.env.INITIAL_TOKENS);
};
