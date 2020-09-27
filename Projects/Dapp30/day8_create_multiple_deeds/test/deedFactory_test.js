const { expectRevert } = require('@openzeppelin/test-helpers');
const DeedFactory = artifacts.require('DeedFactory');
const Deed = artifacts.require('Deed');

// accounts[0] : owner of DeedFactory
// accounts[1] : creates the Deed
// accounts[2] : lawyer
// accounts[3] : beeneficiary

contract('Tests for DeedFactory and Deed smart contract', (accounts) => {
  let deedFactory;
  let deed;
  const amount = web3.utils.toWei('2', 'ether');

  const createDeed = async (unixTimestame) => {
    await deedFactory.createDeed(accounts[2], accounts[3], unixTimestame, {
      value: amount,
      from: accounts[1],
    });

    const deployedDeeds = await deedFactory.getDeployedDeeds();

    // const deed = new web3.eth.Contract(Deed.abi, address);
    return await Deed.at(deployedDeeds[deployedDeeds.length - 1]); // return the most recent created deed
  };

  beforeEach(async () => {
    deedFactory = await DeedFactory.new({ from: accounts[0] });

    const earliestTransferDate = new Date(); // can transfer just after the creation
    const unixTimestame = Date.parse(earliestTransferDate) / 1000;
    deed = await createDeed(unixTimestame);
  });

  it('Should deploy deed smart contract', async () => {
    const earliestTransferDate = new Date(); // can transfer just after the creation
    const unixTimestame = Date.parse(earliestTransferDate) / 1000;

    const deed = await createDeed(unixTimestame);

    const deedBalance = await deed.balanceOf();
    const deedOwner = await deed.deedOwner();
    const lawyer = await deed.lawyer();
    const beneficiary = await deed.beneficiary();

    const deployedDeeds = await deedFactory.getDeployedDeeds();

    assert(
      deed.address === deployedDeeds[deployedDeeds.length - 1],
      'Deployed deed address do not match'
    );
    assert(
      deedBalance.toString() === amount,
      'Deed balance does not matches the amount'
    );
    assert(
      deedOwner === accounts[1] &&
        lawyer === accounts[2] &&
        beneficiary === accounts[3],
      'account addresses do not match'
    );
  });

  it('Should create multiple deeds', async () => {
    deedFactory = await DeedFactory.new({ from: accounts[0] });
    const unixTimestame = Date.parse(new Date()) / 1000;

    await createDeed(unixTimestame);
    await createDeed(unixTimestame);
    await createDeed(unixTimestame);

    const deployedDeeds = await deedFactory.getDeployedDeeds();

    assert(deployedDeeds.length === 3, 'no of deployed deeds do not match');
  });

  it('Should transfer ether from deed to benificiary', async () => {
    const initialBenificiaryBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[3])
    );

    await deed.transfer({ from: accounts[2] });

    const finalDeedBalance = await deed.balanceOf();
    const finalBenificiaryBalance = web3.utils.toBN(
      await web3.eth.getBalance(accounts[3])
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

    deed = await createDeed(unixTimestame);

    await expectRevert(
      deed.transfer({ from: accounts[2] }),
      'too early to transfer'
    );
  });
});
