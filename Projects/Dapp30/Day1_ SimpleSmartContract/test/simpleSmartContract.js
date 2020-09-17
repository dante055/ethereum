const SimpleSmartContract = artifacts.require('SimpleSmartContract');

contract('SimpleSmartContract', () => {
  it('Should deploy smart contract', async () => {
    const simpleSmartContract = await SimpleSmartContract.deployed();
    assert(simpleSmartContract.address !== '', 'Contract address is empty');
    assert.ok(
      simpleSmartContract.address,
      'evaluates to 0 or false or is emty string'
    );
  });
});
