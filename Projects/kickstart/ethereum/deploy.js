const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
// const { interface, bytecode } = require('./compile');
const compiledFactory = require('./build/CampaignFactory.json');
require('dotenv').config({ path: './.env' });

const provider = new HDWalletProvider(
  process.env.MNEMONIC,
  'https://rinkeby.infura.io/v3/7cd400752e9f4f55b69f7b43a9004089'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy using account ', accounts[0]);
  const result = await new web3.eth.Contract(
    JSON.parse(compiledFactory.interface)
  )
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  console.log('contract deployed to ', result.options.address);
}; // we only made this function so that we can use async await
deploy();


// modified contract deployed at 0xd826C83eBb5BB98E8103E08A12eEC04654D1Fe13
