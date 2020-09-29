const { expectRevert } = require('@openzeppelin/test-helpers');
const DeedMultiPayouts = artifacts.require('DeedMultiPayouts');

contract('Tests for DeedMultiPayouts smart contract', (accounts) => {
  let deedMultiPayouts;
  const amountDeposited = web3.utils.toWei('8', 'ether');
  const payouts = 8;
  const interval = 2; // after 2 seconds

  beforeEach(async () => {
    const earliestTransferDate = new Date(); // now
    const unixTimestamp = Date.parse(earliestTransferDate) / 1000;

    deedMultiPayouts = await DeedMultiPayouts.new(
      accounts[1],
      accounts[2],
      unixTimestamp,
      payouts,
      interval,
      { value: amountDeposited, from: accounts[0] }
    );
  });

  it('Should create a deed', async () => {
    const owner = await deedMultiPayouts.owner();
    const deedBalance = await deedMultiPayouts.balanceOf();

    assert.ok(deedMultiPayouts.address, 'deed address does not exist');
    assert(
      deedBalance.toString() === amountDeposited,
      'Deed balance is not equal to the amount deposited'
    );
    assert(owner === accounts[0], 'deed owner address does not match');
  });

  // 8 payouts in 8 transfer each after 2 seconds
  it('Should transfer for all payouts (1)', async () => {
    const payoutAmount = await deedMultiPayouts.amount();
    let now;
    for (i = 0; i < payouts; i++) {
      let initialBenificiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[2])
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      await deedMultiPayouts.transfer({ from: accounts[1] });

      let afterTransferBenificiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[2])
      );

      assert(
        afterTransferBenificiaryBalance
          .sub(initialBenificiaryBalance)
          .toString() === payoutAmount.toString(),
        'beneficiary balance do not match'
      );
    }

    const afterTransferDeedBalance = await deedMultiPayouts.balanceOf();
    assert(
      afterTransferDeedBalance.toString() === '0',
      'deed balance do not match'
    );
  });

  // 8 payouts in 4 trnsfer each after 4 seconds
  it('Should transfer for all payouts (2)', async () => {
    for (i = 0; i < 4; i++) {
      let initialBenificiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[2])
      );

      await new Promise((resolve) => setTimeout(resolve, 4000));
      await deedMultiPayouts.transfer({ from: accounts[1] });

      let afterTransferBenificiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[2])
      );

      assert(
        afterTransferBenificiaryBalance
          .sub(initialBenificiaryBalance)
          .toString() === web3.utils.toWei('2', 'ether'),
        'beneficiary balance do not match'
      );
    }

    const afterTransferDeedBalance = await deedMultiPayouts.balanceOf();
    assert(
      afterTransferDeedBalance.toString() === '0',
      'deed balance do not match'
    );
  });

  // 8 payouts in 5 trnsfer one immidietly and other after each after 4 seconds
  it('Should transfer for all payouts (3)', async () => {
    for (i = 0; i < 5; i++) {
      let initialBenificiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[2])
      );

      if (i > 0) await new Promise((resolve) => setTimeout(resolve, 4000));
      await deedMultiPayouts.transfer({ from: accounts[1] });

      let afterTransferBenificiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[2])
      );

      if (i > 1) {
        assert(
          afterTransferBenificiaryBalance
            .sub(initialBenificiaryBalance)
            .toString() === web3.utils.toWei('2', 'ether'),
          'beneficiary balance do not match'
        );
      }
      // if i == 0, immidiately transfer 1 ether,
      // if i == 1, wait for 4 sec, then eleigible payouts is 2 but duePayouts is eligible - paid which is 1
      else {
        assert(
          afterTransferBenificiaryBalance
            .sub(initialBenificiaryBalance)
            .toString() === web3.utils.toWei('1', 'ether'),
          'beneficiary balance do not match'
        );
      }
    }

    const afterTransferDeedBalance = await deedMultiPayouts.balanceOf();
    assert(
      afterTransferDeedBalance.toString() === '0',
      'deed balance do not match'
    );
  });

  it('Should not transfer if caller is not lawyer', async () => {
    await expectRevert(
      deedMultiPayouts.transfer({ from: accounts[4] }),
      'caller is not lawyer'
    );
  });

  it('Should not transfer if its too early to transfer', async () => {
    const earliestTransferDate = new Date();
    earliestTransferDate.setDate(earliestTransferDate.getDate() + 1);
    const unixTimestame = Date.parse(earliestTransferDate) / 1000;

    deedMultiPayouts = await DeedMultiPayouts.new(
      accounts[1],
      accounts[2],
      unixTimestame,
      payouts,
      interval,
      {
        value: amountDeposited,
        from: accounts[0],
      }
    );

    await expectRevert(
      deedMultiPayouts.transfer({ from: accounts[1] }),
      'too early to transfer'
    );
  });
});
