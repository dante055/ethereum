const { expectRevert } = require('@openzeppelin/test-helpers');
const DeedMultiPayoutsFactory = artifacts.require('DeedMultiPayoutsFactory');
const DeedMultiPayouts = artifacts.require('DeedMultiPayouts');

contract('Tests for DeedMultiPayouts smart contracts', (accounts) => {
  let deedMultiPayoutsFactory;

  beforeEach(async () => {
    deedMultiPayoutsFactory = await DeedMultiPayoutsFactory.new({
      from: accounts[0],
    });
  });

  const createNewDeed = async (
    _lawyer,
    _beneficiary,
    _earliestTransferTime,
    _totalPayouts,
    _interval,
    _deedValue,
    _deedOwner
  ) => {
    await deedMultiPayoutsFactory.createNewDeed(
      _lawyer,
      _beneficiary,
      _earliestTransferTime,
      _totalPayouts,
      _interval,
      { value: _deedValue, from: _deedOwner }
    );

    const deployedDeeds = await deedMultiPayoutsFactory.getAllDeployedDeeds();
    return await DeedMultiPayouts.at(deployedDeeds[deployedDeeds.length - 1]); // return most recently created deed
  };

  it('should deploy factory contract', async () => {
    const deedFactoryOwner = await deedMultiPayoutsFactory.deedFactoryOwner();
    assert.ok(
      deedMultiPayoutsFactory.address,
      'deed factory address does not exist'
    );
    assert(
      deedFactoryOwner === accounts[0],
      'deed factory owner does not match'
    );
  });

  it('should deploy multiple a deed', async () => {
    const deedValue = web3.utils.toWei('8', 'ether');
    const totalPayouts = 8;
    const interval = 2; // 2 sec
    const earliestTransferTime = Date.parse(new Date()) / 1000;

    const deedMultiPayouts1 = await createNewDeed(
      accounts[2],
      accounts[3],
      earliestTransferTime,
      totalPayouts,
      interval,
      deedValue,
      accounts[1]
    );

    const deedMultiPayouts2 = await createNewDeed(
      accounts[5],
      accounts[6],
      earliestTransferTime,
      totalPayouts,
      interval,
      deedValue,
      accounts[4]
    );

    const deedOwner1 = await deedMultiPayouts1.deedOwner();
    const deedOwner2 = await deedMultiPayouts2.deedOwner();

    const deployedDeeds = await deedMultiPayoutsFactory.getAllDeployedDeeds();
    assert(deployedDeeds.length === 2, 'no of deployed deed do not match');

    assert(
      deedOwner1 === accounts[1] && deedOwner2 === accounts[4],
      'Deed owner address do not match'
    );
  });

  // 4 payouts in 4 transfer each after 2 seconds
  it('should Transfer for all payouts (1)', async () => {
    const deedValue = web3.utils.toWei('4', 'ether');
    const totalPayouts = 4;
    const interval = 2; // 2 sec
    const earliestTransferTime = Date.parse(new Date()) / 1000;

    const deedMultiPayouts = await createNewDeed(
      accounts[2],
      accounts[3],
      earliestTransferTime,
      totalPayouts,
      interval,
      deedValue,
      accounts[1]
    );

    for (i = 0; i < 4; i++) {
      let beforeTransferBeneficiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[3])
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await deedMultiPayouts.transfer({ from: accounts[2] });

      let afterTransferBeneficiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[3])
      );
      assert(
        afterTransferBeneficiaryBalance
          .sub(beforeTransferBeneficiaryBalance)
          .toString() === web3.utils.toWei('1', 'ether'),
        'beneficiary balance do not match'
      );
    }

    const afterTransferDeedBalance = await deedMultiPayouts.balanceOf();
    assert(
      afterTransferDeedBalance.toString() === '0',
      'deed balance do not match'
    );
  });

  // 4 payouts in 2 transfer each after 4 seconds
  it('should Transfer for all payouts (2)', async () => {
    const deedValue = web3.utils.toWei('4', 'ether');
    const totalPayouts = 4;
    const interval = 2; // 2 sec
    const earliestTransferTime = Date.parse(new Date()) / 1000;

    const deedMultiPayouts = await createNewDeed(
      accounts[2],
      accounts[3],
      earliestTransferTime,
      totalPayouts,
      interval,
      deedValue,
      accounts[1]
    );

    for (i = 0; i < 2; i++) {
      let beforeTransferBeneficiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[3])
      );

      await new Promise((resolve) => setTimeout(resolve, 4000));
      await deedMultiPayouts.transfer({ from: accounts[2] });

      let afterTransferBeneficiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[3])
      );
      assert(
        afterTransferBeneficiaryBalance
          .sub(beforeTransferBeneficiaryBalance)
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

  // 8 payouts in 5 transfer one immidiately and others after 2 seconds each
  it('should Transfer for all payouts (3)', async () => {
    const deedValue = web3.utils.toWei('8', 'ether');
    const totalPayouts = 8;
    const interval = 2; // 2 sec
    const earliestTransferTime = Date.parse(new Date()) / 1000;

    const deedMultiPayouts = await createNewDeed(
      accounts[2],
      accounts[3],
      earliestTransferTime,
      totalPayouts,
      interval,
      deedValue,
      accounts[1]
    );

    for (i = 0; i < 5; i++) {
      let beforeTransferBeneficiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[3])
      );
      if (i > 0) await new Promise((resolve) => setTimeout(resolve, 4000));
      await deedMultiPayouts.transfer({ from: accounts[2] });
      let afterTransferBeneficiaryBalance = web3.utils.toBN(
        await web3.eth.getBalance(accounts[3])
      );
      if (i > 1) {
        assert(
          afterTransferBeneficiaryBalance
            .sub(beforeTransferBeneficiaryBalance)
            .toString() === web3.utils.toWei('2', 'ether'),
          'beneficiary balance do not match'
        );
      }
      // if i == 0, immidiately transfer 1 ether,
      // if i == 1, wait for 4 sec, then eleigible payouts is 2 but duePayouts is eligible - paid which is 1
      else {
        assert(
          afterTransferBeneficiaryBalance
            .sub(beforeTransferBeneficiaryBalance)
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
    const deedMultiPayouts = await createNewDeed(
      accounts[2],
      accounts[3],
      Date.parse(new Date()) / 1000,
      4,
      2,
      web3.utils.toWei('4', 'ether'),
      accounts[1]
    );

    await expectRevert(
      deedMultiPayouts.transfer({ from: accounts[4] }),
      'caller is not lawyer'
    );
  });

  it('Should not transfer if its too early to transfer', async () => {
    const earliestTransferDate = new Date();
    earliestTransferDate.setDate(earliestTransferDate.getDate() + 1);
    const unixTimestame = Date.parse(earliestTransferDate) / 1000;

    const deedMultiPayouts = await createNewDeed(
      accounts[2],
      accounts[3],
      unixTimestame,
      4,
      2,
      web3.utils.toWei('4', 'ether'),
      accounts[1]
    );

    await expectRevert(
      deedMultiPayouts.transfer({ from: accounts[2] }),
      'too early to transfer'
    );
  });

  it('Should not transfer if all payoust has been completed', async () => {
    const totalPayouts = 4;
    const interval = 1;

    const deedMultiPayouts = await createNewDeed(
      accounts[2],
      accounts[3],
      Date.parse(new Date()) / 1000,
      totalPayouts,
      interval,
      web3.utils.toWei('4', 'ether'),
      accounts[1]
    );

    await new Promise((resolve) => setTimeout(resolve, 5000)); // after 5 sec transfer all payouts
    await deedMultiPayouts.transfer({ from: accounts[2] });

    await expectRevert(
      deedMultiPayouts.transfer({ from: accounts[2] }),
      'no payout left'
    );
  });
});
