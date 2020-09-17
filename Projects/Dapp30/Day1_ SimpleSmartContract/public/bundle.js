var contractABI = [];
// see truffle console for addess and port
var contractAddress = '0x89EAaEE310A1e0c52103F1cbB304fdA7AB5e37f1';
var web3 = new Web3('http://localhost:9545');
var simpleSmartContract = new web3.eth.Contract(contractABI, contractAddress);

console.log(simpleSmartContract);

web3.eth.getAccounts().then(console.log);
