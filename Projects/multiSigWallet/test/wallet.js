const { expectRevert } = require('@openzeppelin/test-helpers');
const MultiSigWallet = artifacts.require('MultiSigWallet');

contract('MultiSigWallet', (accounts) => {
  let wallet;
  beforeEach(async () => {
    wallet = await MultiSigWallet.new(
      [accounts[0], accounts[1], accounts[2]],
      2
    );
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: wallet.address,
      value: 1000,
    });
  });

  it('contract successfully deployed', () => {
    assert.ok(wallet.address);
  });

  it('check contract balance', async () => {
    const balance = await web3.eth.getBalance(wallet.address);
    assert.ok(balance === '1000');
  });

  it('should have correct approvers and quorum', async () => {
    const approvers = await wallet.getApprovers();
    const quorum = await wallet.quorum();
    assert(approvers.length === 3);
    assert(
      approvers[0] === accounts[0] &&
        approvers[1] === accounts[1] &&
        approvers[2] === accounts[2],
      'approvers account dont match'
    );
    assert(quorum.toNumber() === 2, 'quorum no dont match');
  });

  it('contract is able to receive ether', async () => {
    const balanceBefore = web3.utils.toBN(
      await web3.eth.getBalance(wallet.address)
    );
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: wallet.address,
      value: 1000,
    });
    const balanceAfter = web3.utils.toBN(
      await web3.eth.getBalance(wallet.address)
    );
    assert(balanceAfter.sub(balanceBefore).toNumber() === 1000);
  });

  it('should create transfer', async () => {
    await wallet.createTransfer(100, accounts[4], { from: accounts[0] });
    const transfer = await wallet.getTransfers();
    assert(transfer.length === 1);
    assert(transfer[0].id === '0');
    assert(transfer[0].amount == '100');
    assert(transfer[0].to === accounts[4], 'recepient account dont match');
    assert(transfer[0].approvals === '0');
    assert(transfer[0].sent === false);
  });

  it('should not create transfer', async () => {
    // try {
    //   await wallet.createTransfer(100, accounts[4], { from: accounts[5] });
    // } catch (e) {
    //   // console.log(e);
    //   assert.ok(e);
    // }

    await expectRevert(
      wallet.createTransfer(100, accounts[4], { from: accounts[5] }),
      'only approver are allowed'
    );
  });

  it('should increment approvers', async () => {
    await wallet.createTransfer(100, accounts[4], { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[0] });
    const transfer = await wallet.getTransfers();
    const balance = await web3.eth.getBalance(wallet.address);

    assert(transfer[0].approvals === '1');
    assert(transfer[0].sent === false);
    assert(balance === '1000');
  });

  it('should transfer if quorum reaced', async () => {
    const balanceBefore = web3.utils.toBN(
      await web3.eth.getBalance(wallet.address)
    );
    await wallet.createTransfer(100, accounts[4], { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[1] });
    const transfer = await wallet.getTransfers();
    const balanceAfter = web3.utils.toBN(
      await web3.eth.getBalance(wallet.address)
    );

    assert(transfer[0].approvals === '2');
    assert(transfer[0].sent === true);

    // for string
    // assert(parseInt(balanceBefore) - parseInt(balanceAfter) === 100);

    assert(balanceBefore.sub(balanceAfter).toNumber() === 100);
  });

  it('should NOT approved transfer if sender is not approved', async () => {
    await wallet.createTransfer(100, accounts[4], { from: accounts[0] });
    await expectRevert(
      wallet.approveTransfer(0, { from: accounts[5] }),
      'only approver are allowed'
    );
  });

  it('should NOT send  transfer if transfer is already sent', async () => {
    await wallet.createTransfer(100, accounts[4], { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[1] });
    await expectRevert(
      wallet.approveTransfer(0, { from: accounts[2] }),
      'transfer has already been sent'
    );
  });

  it('should NOT approved transfer twice', async () => {
    await wallet.createTransfer(100, accounts[4], { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[0] });
    await expectRevert(
      wallet.approveTransfer(0, { from: accounts[0] }),
      'cannot approve transfer twice'
    );
  });
});
