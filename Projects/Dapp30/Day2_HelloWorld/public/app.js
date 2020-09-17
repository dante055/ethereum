const Web3 = require('web3');
const helloWordABI = [
  {
    inputs: [],
    name: 'hello',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
    constant: true,
  },
];
const helloWorldAddress = '0x89EAaEE310A1e0c52103F1cbB304fdA7AB5e37f1';
const web3 = new Web3('http://localhost:9545');
const helloWorld = new web3.eth.Contract(helloWordABI, helloWorldAddress);

// to wait for full html document to be loaded
document.addEventListener('DOMContentLoaded', () => {
  helloWorld.methods
    .hello()
    .call()
    .then((result) => {
      document.getElementById('hello').innerHTML = result;
    });
});
