const Token = artifacts.require('MyToken');

const chai = require('./setupChai.js');
const BN = web3.utils.BN;
const expect = chai.expect;

contract('Token Test', async (accounts) => {
  const [initialHolder, recipient, anotherAccount] = accounts;

  beforeEach(async () => {
    this.myToken = await Token.new(process.env.INITIAL_TOKENS); // delpoy new instance
  });
  // we want to test MyToken  on its own not in conjection with tokenSale
  // beforeEach is a kind of hook which hooks itself to unit testing and is call everytime

  it('All token should be in my account', async () => {
    // let instance = await MyToken.deployed();
    let instance = this.myToken;
    let totalSupply = await instance.totalSupply();

    return expect(
      instance.balanceOf(initialHolder)
    ).to.eventually.be.a.bignumber.equal(totalSupply);
  });

  it('I can sent tokens from Account 1 to Account 2', async () => {
    const sendTokens = 1;
    // let instance = await MyToken.deployed();
    let instance = this.myToken;
    let totalSupply = await instance.totalSupply();

    expect(
      instance.balanceOf(initialHolder)
    ).to.eventually.be.a.bignumber.equal(totalSupply);

    expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;

    expect(
      instance.balanceOf(initialHolder)
    ).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));

    return expect(
      instance.balanceOf(recipient)
    ).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
  });

  it('It is not possible to send more tokens than account 1 has', async () => {
    const sendTokens = 1;
    // let instance = await MyToken.deployed();
    let instance = this.myToken;
    let balanceOfAccount = await instance.balanceOf(initialHolder);

    expect(instance.transfer(recipient, new BN(balanceOfAccount + 1))).to
      .eventually.be.rejected;

    return expect(
      instance.balanceOf(initialHolder)
    ).to.eventually.be.a.bignumber.equal(balanceOfAccount);
  });
});
