const { expectRevert } = require('@openzeppelin/test-helpers');
const Deed = artifacts.require('Deed');

contract('Test for Deed smart contract', (accounts) => {
  let deed;
  const amount = web3.utils.toWei('2', 'ether');
  beforeEach(async () => {
    const earliestTransferDate = new Date('2020-7-25');
    // const earliestTransferDate = new Date(); // can transfer just after the creation
    const unixTimestame = Date.parse(earliestTransferDate) / 1000;

    deed = await Deed.new(accounts[1], accounts[2], unixTimestame, {
      value: amount,
      from: accounts[0],
    });
  });

  it('Should create deed', async () => {
    const deedBalance = await deed.balanceOf();
    assert.ok(deed.address);
    assert(
      deedBalance.toString() === amount,
      'Deed balance is not equal to the amount deposited'
    );
  });

  it('Should transfer ether from deed to benificiary', async () => {
    const initialBenificiaryBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    await deed.transfer({ from: accounts[1] });

    const finalDeedBalance = await deed.balanceOf();
    const finalBenificiaryBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[2])
    );

    assert(
      finalDeedBalance.toNumber() === 0,
      'Deed balance after transfer should be 0'
    );
    assert(
      finalBenificiaryBalance.sub(initialBenificiaryBalance).toString() ===
        amount,
      'the benificiary balance should be increased after transfer'
    );
  });

  it('Should not transfer if caller is not lawyer', async () => {
    await expectRevert(
      deed.transfer({ from: accounts[4] }),
      'caller is not lawyer'
    );
  });

  it('Should not transfer if its too early to transfer', async () => {
    const earliestTransferDate = new Date();
    earliestTransferDate.setDate(earliestTransferDate.getDate() + 1);
    const unixTimestame = Date.parse(earliestTransferDate) / 1000;

    deed = await Deed.new(accounts[1], accounts[2], unixTimestame, {
      value: amount,
      from: accounts[0],
    });

    await expectRevert(
      deed.transfer({ from: accounts[1] }),
      'too early to transfer'
    );
  });
});

