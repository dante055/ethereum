const EthSwap = artifacts.require('EthSwap');
const CustomCoin = artifacts.require('CustomCoin');
const Dai = artifacts.require('Dai');

// conversion rate: 1 CC = 1000 wei or 1 DAI = 1000 wei
const conversionRateCc = 500;
const conversionRateDai = 1000;

// get byte32 of all the tickers
const [CC, DAI] = ['CC', 'DAI'].map(ticker => web3.utils.asciiToHex(ticker));

// module.exports = async function (deployer, _network, accounts) {
module.exports = async function (deployer, _network, [admin, recipient]) {
  // create/deploy a new mock tokens
  await Promise.all(
    [CustomCoin, Dai].map(contract =>
      deployer.deploy(contract, { from: admin })
    )
  );

  // interact with the token
  const [cc, dai] = await Promise.all(
    [CustomCoin, Dai].map(contract => contract.deployed())
  );

  // deloy ethSwap
  await deployer.deploy(EthSwap, { from: admin });

  // interact with eth swap
  const ethSwap = await EthSwap.deployed();

  // add tokens to ethSwap;
  await Promise.all([
    ethSwap.addTokens(CC, cc.address, conversionRateCc),
    ethSwap.addTokens(DAI, dai.address, conversionRateDai),
  ]);

  //   mine token from admin account and add them to ethSwap
  await Promise.all(
    [cc, dai].map(contract =>
      contract.faucet(ethSwap.address, web3.utils.toWei('10', 'ether'), {
        from: admin,
      })
    )
  );
};

/*
  await deployer.deploy(CustomCoin, { from: admin });
  await deployer.deploy(Dai, { from: admin }); 

  const Cc = await CustomCoin.deployed();
  const Dai = await Dai.deployed();
  
*/
