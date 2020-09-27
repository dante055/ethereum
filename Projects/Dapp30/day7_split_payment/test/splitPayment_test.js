const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const SplitPayment = artifacts.require('SplitPayment');

contract('Tests for SplitPayment smart contract', (accounts) => {
  let splitPayment;
  beforeEach(async () => {
    splitPayment = await SplitPayment.new();
  });

  it('Should deposite ether', async () => {
    const amount = web3.utils.toWei('1', 'ether');
    await web3.eth.sendTransaction({
      to: splitPayment.address,
      from: accounts[1],
      value: amount,
    });
    const contractBalance = await splitPayment.balanceOf();
    assert(
      contractBalance.toString() === amount,
      'contract balance does not match'
    );
  });

  it('Shoud transfer split payments to multiple accounts', async () => {
    const amount1 = web3.utils.toWei('1', 'ether');
    const amount2 = web3.utils.toWei('2', 'ether');

    const initialContractBalance = await splitPayment.balanceOf();
    const initialAccount1Balance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );
    const initialAccount2Balance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    await web3.eth.sendTransaction({
      to: splitPayment.address,
      from: accounts[3],
      value: web3.utils.toWei('3', 'ether'),
    });

    await splitPayment.transfer(
      [accounts[1], accounts[2]],
      [amount1, amount2],
      { from: accounts[0] }
    );

    const finalContractBalance = await splitPayment.balanceOf();
    const finalAccount1Balance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[1])
    );
    const finalAccount2Balance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    assert(
      initialContractBalance.toString() === finalContractBalance.toString(),
      'Contract balnce do not match'
    );
    assert(
      finalAccount1Balance.sub(initialAccount1Balance).toString() === amount1 &&
        finalAccount2Balance.sub(initialAccount2Balance).toString() === amount2,
      'Acount balnces do not match'
    );
  });

  it('Shoud not transfer if caller is not owner', async () => {
    await expectRevert(
      splitPayment.transfer(
        [accounts[1], accounts[2]],
        [web3.utils.toWei('1', 'ether'), web3.utils.toWei('1', 'ether')],
        { from: accounts[1] }
      ),
      'Caller is not owner'
    );
  });

  it('Shoud not transfer if to and amount aaray does not have same length', async () => {
    await expectRevert(
      splitPayment.transfer(
        [accounts[1], accounts[2]],
        [web3.utils.toWei('1', 'ether')],
        { from: accounts[0] }
      ),
      'To and amount array must have same length'
    );
  });

  it('Shoud not transfer if funds are insufficent', async () => {
    await expectRevert(
      splitPayment.transfer(
        [accounts[1], accounts[2]],
        [web3.utils.toWei('1', 'ether'), web3.utils.toWei('1', 'ether')],
        { from: accounts[0] }
      ),
      'Not enough funds to process each transaction'
    );
  });
});
