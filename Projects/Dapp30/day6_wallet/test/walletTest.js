const { expectRevert } = require('@openzeppelin/test-helpers');
const Wallet = artifacts.require('Wallet');

contract('Tests for Wallet smart contract', (accounts) => {
  let wallet;
  beforeEach(async () => {
    wallet = await Wallet.new({ from: accounts[0] });
  });

  it('Should deposit some ether', async () => {
    const amount = web3.utils.toWei('1', 'ether');
    await web3.eth.sendTransaction({
      to: wallet.address,
      from: accounts[1],
      value: amount,
    });
    const balance = await wallet.balanceOf();
    assert(balance.toString() === amount, 'Amount transfer do not match');
  });

  it('Should transfer ether', async () => {
    const amount = web3.utils.toWei('1', 'ether');
    const initialContractBalance = await wallet.balanceOf();
    const oldAccountBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    await web3.eth.sendTransaction({
      to: wallet.address,
      from: accounts[1],
      value: amount,
    });

    await wallet.transfer(accounts[2], amount);

    const afterTransferContractBalance = await wallet.balanceOf();
    const newAccountBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );
    assert(
      initialContractBalance.toNumber() ===
        afterTransferContractBalance.toNumber(),
      'Contract balance do not match'
    );
    assert(
      newAccountBalance.sub(oldAccountBalance).toString() === amount,
      'Acount balnace do not match'
    );
  });

  it('should not transfer ether if caller is not the owner', async () => {
    await expectRevert(
      wallet.transfer(accounts[1], web3.utils.toWei('1', 'ether'), {
        from: accounts[1],
      }),
      'Caller is not owner'
    );
  });

  it('should not transfer ether if caller is not the owner', async () => {
    await expectRevert(
      wallet.transfer(accounts[1], web3.utils.toWei('1', 'ether'), {
        from: accounts[0],
      }),
      'Not enough funds to transfer'
    );
  });
});
