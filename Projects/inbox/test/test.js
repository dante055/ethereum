const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let accounts;
let inbox;
const INITIAL_STRING = 'Hi there';
const NEW_STRING = 'Bye';

beforeEach(async () => {
  // get list of all accounts

  /*
    //Promises
    web3.eth.getAccounts()
    .then(fetchedAccounts => {
      console.log(fetchedAccounts);
    });
  */
  accounts = await web3.eth.getAccounts();

  // use one of those to deploy the contract
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: [INITIAL_STRING] })
    .send({ from: accounts[0], gas: '1000000' });

});

describe('Inbox-test', () => {
  it('deploys a contract', () => {
    assert.ok(inbox.options.address); //if exits / contract properly deployed
  });

  it('has a default msg', async () => {
    const message = await inbox.methods.message().call();
    // first set of parenthises is for any arguments this fun requre and second is use to customise how that fun is call
    assert.equal(message, INITIAL_STRING);
  }); // calling a method return a promise

  it('modifies the msg', async () => {
    await inbox.methods.setMessage(NEW_STRING).send({ from: accounts[0]}); // gas paremeter is optional
    // whenever we do a transaction we get a transaction hash
    const message = await inbox.methods.message().call();
    assert.equal(message, NEW_STRING);
  });
});
