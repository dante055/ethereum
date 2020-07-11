const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaign;
let campaignAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  await factory.methods.createCampaign('100').send({
    from: accounts[1],
    gas: '1000000'
  }); // creating campaign from account[1]

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call(); // array of campaign addresses
  // assign the first address from the array

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  ); // when have a deployed contact and want to instruct web3 about its existance
});

describe('Campaigns', () => {
  it('deployes a factory and campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('total no of campaigns is 1', async () => {
    const totalCampaigns = await factory.methods.getDeployedCampaigns().call();
    assert.equal(1, totalCampaigns.length);
  });

  it('marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[1], manager);
  });

  it('minimumContribution is 100 wei', async () => {
    const minimumContribution = await campaign.methods
      .minimumContribution()
      .call();
    assert.equal(100, minimumContribution);
  });

  it('allows people to contribure mone and mark them as approvers', async () => {
    await campaign.methods.contribute().send({
      from: accounts[2],
      value: '200'
    });
    const isContributers = await campaign.methods.approvers(accounts[2]).call(); //we cant retrive entire maping but only single value
    assert(isContributers);
  });

  it('requires a minimum contribution', async () => {
    try {
      await campaign.methods.contribute().send({
        value: '5',
        from: accounts[2]
      });
      assert(false); // will also throw an error
    } catch (err) {
      if (err.name === 'AssertionError') {
        assert(false);
      } else {
        assert(err);
      }
    }
  });

  it('allows manager to make a payment request', async () => {
    await campaign.methods
      .createRequest('Buy batteries', '100', accounts[2])
      .send({
        from: accounts[1],
        gas: '1000000'
      });
    const request = await campaign.methods.requests(0).call();

    assert.equal('Buy batteries', request.description);
  });

  it('processes requests', async () => {
    // accounts[1]: manager; accounts[2]: contributer; accounts[3]:reciver
    let initialBalance = await web3.eth.getBalance(accounts[3]);
    initialBalance = web3.utils.fromWei(initialBalance, 'ether');
    // console.log('initialBalance: ', initialBalance);
    initialBalance = parseFloat(initialBalance);

    await campaign.methods.contribute().send({
      from: accounts[2],
      value: web3.utils.toWei('10', 'ether')
    });

    await campaign.methods
      .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[3])
      .send({ from: accounts[1], gas: '1000000' }); // on manager can create request

    await campaign.methods.approveRequest(0).send({
      from: accounts[2],
      gas: '1000000'
    }); // approve by contributers

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[1],
      gas: '1000000'
    }); // finalize by campaign manager

    let balance = await web3.eth.getBalance(accounts[3]); // reciver balance
    balance = web3.utils.fromWei(balance, 'ether');
    // console.log('final balance: ', balance);
    balance = parseFloat(balance); // string to float

    assert(balance > initialBalance + 4); // in ether, dfault balance of account is 100 ether
  });
});
