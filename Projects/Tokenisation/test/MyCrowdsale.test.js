const Token = artifacts.require('MyToken');
const TokenSale = artifacts.require('MyTokenSale');
const KycContract = artifacts.require('KycContract');

const chai = require('./setupChai.js');
const BN = web3.utils.BN;
const expect = chai.expect;

contract('Token Test', async (accounts) => {
  const [initialHolder, recipient, anotherAccount] = accounts;

  it('deployment account should have no tokens', async () => {
    let instance = await Token.deployed();

    return expect(
      instance.balanceOf(initialHolder)
    ).to.eventually.be.a.bignumber.equal(new BN(0));
  });

  it('All tokens sould be in TokenSale smart contract', async () => {
    let instance = await Token.deployed();
    let balanceOfTokenSaleSmartContract = await instance.balanceOf(
      TokenSale.address
    );
    let totalSupply = await instance.totalSupply();

    return expect(balanceOfTokenSaleSmartContract).to.be.a.bignumber.equal(
      totalSupply
    );

    // expect(
    //   instance.balanceOf(TokenSale.address)
    // ).to.eventually.be.a.bignumber.equal(new BN(process.env.INITIAL_TOKENS));
  });

  it('shoud be possible to buy token sending ethers to smart tokens', async () => {
    let tokenInstance = await Token.deployed();
    let tokenSaleInstance = await TokenSale.deployed();
    let balanceBeforeBuying = await tokenInstance.balanceOf(recipient);

    expect(
      tokenSaleInstance.sendTransaction({
        from: recipient,
        value: web3.utils.toWei('1', 'wei'),
      })
    ).to.eventually.be.rejected;

    expect(balanceBeforeBuying).to.be.a.bignumber.equal(
      await tokenInstance.balanceOf(recipient)
    );

    let kycInstance = await KycContract.deployed();
    await kycInstance.setKycCompleted(recipient);

    expect(
      tokenSaleInstance.sendTransaction({
        from: recipient,
        value: web3.utils.toWei('1', 'wei'),
      })
    ).to.eventually.be.fulfilled;

    return expect(balanceBeforeBuying + 1).to.be.a.bignumber.equal(
      await tokenInstance.balanceOf(recipient)
    );
  });
});
