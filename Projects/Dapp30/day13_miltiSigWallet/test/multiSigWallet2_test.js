const { expectRevert } = require('@openzeppelin/test-helpers');
const Factory = artifacts.require('Factory2');
const MultiSigWallet = artifacts.require('MultiSigWallet2');

contract('Tests for MultiSigWallet2 smart contract', (accounts) => {
  let factory;
  let multiSigWallet;

  beforeEach(async () => {
    const quorum = 2;
    factory = await Factory.new();

    multiSigWallet = await createMultiSigWallet(
      [accounts[0], accounts[1], accounts[2]],
      quorum,
      accounts[0]
    );
  });

  const createMultiSigWallet = async (address, quorum, owner) => {
    await factory.createMultiSigWallet(address, quorum, { from: owner });

    const walletAddresses = await factory.getAllWalletAddress();
    return MultiSigWallet.at(walletAddresses[walletAddresses.length - 1]);
  };

  it('should create a multiSigWallet', async () => {
    const owner1 = await multiSigWallet.walletOwner();

    multiSigWallet = await createMultiSigWallet(
      [accounts[2], accounts[3], accounts[4]],
      3,
      accounts[2]
    );

    const owner2 = await multiSigWallet.walletOwner();
    const walletAddresses = await factory.getAllWalletAddress();

    assert(walletAddresses.length === 2, 'total no of wallet dont match');
    assert(
      owner1 === accounts[0] && owner2 === accounts[2],
      'wallet owner address not matching'
    );
  });

  it('should not create a multiSigWallet if approvers array has dublicate values', async () => {
    await expectRevert(
      createMultiSigWallet(
        [accounts[2], accounts[3], accounts[3]],
        3,
        accounts[2]
      ),
      'Same address cant become approver multiple times!'
    );
  });

  it('should not create a multiSigWallet if owners address isnt present in approvers array', async () => {
    await expectRevert(
      createMultiSigWallet(
        [accounts[1], accounts[2], accounts[3]],
        3,
        accounts[0]
      ),
      'You forgot to add your own address to approvers array!'
    );
  });

  it('should deposite some eth in the contract', async () => {
    const amount = web3.utils.toWei('1', 'ether');
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: amount,
    });

    const contractBalnace = await multiSigWallet.balanceOf();

    assert(contractBalnace.toString() === amount, 'balance dont match');
  });

  it('should not deposite eth in the contract if caller isnt approver ', async () => {
    await expectRevert(
      web3.eth.sendTransaction({
        from: accounts[5],
        to: multiSigWallet.address,
        value: web3.utils.toWei('1', 'ether'),
      }),
      'Caller is not approver!'
    );
  });

  it('should create a transfer', async () => {
    const depositeAmount = web3.utils.toWei('2', 'ether');
    const transferAmount = web3.utils.toWei('1', 'ether');

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: depositeAmount,
    });
    await multiSigWallet.createTransfer(accounts[4], transferAmount, {
      from: accounts[1],
    });

    const transfer = await multiSigWallet.transfers(0);

    assert(
      transfer._amount.toString() === transferAmount,
      'transfer amount do not matches'
    );
    assert(
      transfer._from === accounts[1] && transfer._to === accounts[4],
      'the sender and recepient address do not matches'
    );
  });

  it('should not create a transfer if caller is not an approver', async () => {
    await expectRevert(
      multiSigWallet.createTransfer(
        accounts[4],
        web3.utils.toWei('1', 'ether'),
        { from: accounts[5] }
      ),
      'Caller is not approver!'
    );
  });

  it('should not create a transfer if contract balance is insufficient', async () => {
    await expectRevert(
      multiSigWallet.createTransfer(
        accounts[4],
        web3.utils.toWei('1', 'ether'),
        { from: accounts[2] }
      ),
      'The contract has not suffecient balance left!'
    );
  });

  it('should approve a transfer', async () => {
    const depositeAmount = web3.utils.toWei('2', 'ether');
    const transferAmount = web3.utils.toWei('1', 'ether');

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: depositeAmount,
    });
    await multiSigWallet.createTransfer(accounts[4], transferAmount, {
      from: accounts[1],
    });
    await multiSigWallet.approveTransfer(0, { from: accounts[0] });

    const transfer = await multiSigWallet.transfers(0);

    assert(
      transfer._noOfApprovals.toString() === '1',
      'no of approvers dont match'
    );
  });

  it('should confirm a transfer', async () => {
    const depositeAmount = web3.utils.toWei('3', 'ether');
    const transferAmount = web3.utils.toWei('1', 'ether');
    const recepientBalnceBefore = web3.utils.toBN(
      await web3.eth.getBalance(accounts[4])
    );

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: depositeAmount,
    });
    await multiSigWallet.createTransfer(accounts[4], transferAmount, {
      from: accounts[1],
    });
    await multiSigWallet.approveTransfer(0, { from: accounts[0] });
    await multiSigWallet.approveTransfer(0, { from: accounts[1] });

    const transfer = await multiSigWallet.transfers(0);
    const contractBalnace = await multiSigWallet.balanceOf();
    const recepientBalnceAfter = web3.utils.toBN(
      await web3.eth.getBalance(accounts[4])
    );

    assert(
      transfer._noOfApprovals.toString() === '2',
      'no of approvers dont match'
    );
    assert(
      recepientBalnceAfter.sub(recepientBalnceBefore).toString() ===
        transferAmount,
      'transfer amount dont match'
    );
    assert(
      contractBalnace.toString() === web3.utils.toWei('2', 'ether'),
      'contract balance dont match'
    );
  });

  it('should not approve a transfer if caller is not approver', async () => {
    const depositeAmount = web3.utils.toWei('3', 'ether');
    const transferAmount = web3.utils.toWei('1', 'ether');

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: depositeAmount,
    });
    await multiSigWallet.createTransfer(accounts[4], transferAmount, {
      from: accounts[1],
    });

    await expectRevert(
      multiSigWallet.approveTransfer(0, { from: accounts[5] }),
      'Caller is not approver!'
    );
  });

  it('should not approve a transfer if you have already approved a transfer once', async () => {
    const depositeAmount = web3.utils.toWei('3', 'ether');
    const transferAmount = web3.utils.toWei('1', 'ether');

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: depositeAmount,
    });
    await multiSigWallet.createTransfer(accounts[4], transferAmount, {
      from: accounts[1],
    });
    await multiSigWallet.approveTransfer(0, { from: accounts[0] });

    await expectRevert(
      multiSigWallet.approveTransfer(0, { from: accounts[0] }),
      'You have already approved this transfer!'
    );
  });

  it('should not approve/confirm a transfer if transfer has alrady been confirmed and sent', async () => {
    const depositeAmount = web3.utils.toWei('3', 'ether');
    const transferAmount = web3.utils.toWei('1', 'ether');

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: depositeAmount,
    });
    await multiSigWallet.createTransfer(accounts[4], transferAmount, {
      from: accounts[1],
    });
    await multiSigWallet.approveTransfer(0, { from: accounts[0] });
    await multiSigWallet.approveTransfer(0, { from: accounts[1] });

    await expectRevert(
      multiSigWallet.approveTransfer(0, { from: accounts[2] }),
      'Transfer has already been sent!'
    );
  });

  it('should not approve a transfer if contract balance is insufficient', async () => {
    const depositeAmount = web3.utils.toWei('1', 'ether');
    const transferAmount = web3.utils.toWei('1', 'ether');

    await web3.eth.sendTransaction({
      from: accounts[0],
      to: multiSigWallet.address,
      value: depositeAmount,
    });
    /* create 1st transfer */
    await multiSigWallet.createTransfer(accounts[4], transferAmount, {
      from: accounts[1],
    });
    /* create 2nd transfer */
    await multiSigWallet.createTransfer(accounts[5], transferAmount, {
      from: accounts[2],
    });
    /* approve and confrin the 1st transfer (now the contract blance has drained) */
    await multiSigWallet.approveTransfer(0, { from: accounts[0] });
    await multiSigWallet.approveTransfer(0, { from: accounts[1] });

    await expectRevert(
      multiSigWallet.approveTransfer(1, { from: accounts[0] }),
      'The contract has not suffecient balance left!'
    );
  });
});
