const SimpleStorage = artifacts.require('SimpleStorage');

contract('Simple Storage Smart Contract Test', () => {
  let simpleStorage;

  beforeEach(async () => {
    simpleStorage = await SimpleStorage.deployed();
  });

  it('Initial data should be empty', async () => {
    let result = await simpleStorage.getData();
    assert.strictEqual(result, '', 'The initial string is not empty');
  });

  it('Should set the value of the data variable', async () => {
    await simpleStorage.setData('Test String');
    let result = await simpleStorage.getData();
    assert.strictEqual(
      result,
      'Test String',
      'The initial string is not empty'
    );
  });
});
