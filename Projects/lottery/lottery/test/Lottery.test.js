const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let accounts;
let lottery;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("contract successfully deployed", () => {
    assert.ok(lottery.options.address);
  });

  // when someone enters their address should be added in the array
  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether")
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether")
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether")
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether")
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it("require a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false); // if not err is thrown
    } catch (err) {
      assert(err); // checks for truth
      // asser.ok() checks for existance
    } // we capture error in async await by using try catch , traditional promises uses catch statement
  });

  it("only manager can call pick winner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: account[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("sends money and resets players array", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether")
    });

    const initialBalance = await web3.eth.getBalance(accounts[1]);
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    const finalBalance = await web3.eth.getBalance(accounts[1]);
    const diffrence = finalBalance - initialBalance;

    assert(diffrence > web3.utils.toWei("1.8", "ether"));
  });

  it("players array is empty after choosing winner", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether")
    });
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const players = await lottery.methods.getPlayers().call();
    assert.equal(0, players.length);
  });

  it("final account balance is zero", async () => {
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether")
    });

    // const initialContractBalance = await web3.eth.getBalance(lottery.options.address);
    // console.log('currentContractBalance', initialContractBalance);

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const finalContractBalance = await web3.eth.getBalance(
      lottery.options.address
    );
    // console.log('finalContractBalance', finalContractBalance);
    assert.equal(0, finalContractBalance);
  });
});
