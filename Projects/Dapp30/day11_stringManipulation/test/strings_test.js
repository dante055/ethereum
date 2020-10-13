const Strings = artifacts.require('Strings');

contract('test for strings smart contract', (accounts) => {
  let strings;
  beforeEach(async () => {
    strings = await Strings.new();
  });
  it('should work', async () => {});
});
