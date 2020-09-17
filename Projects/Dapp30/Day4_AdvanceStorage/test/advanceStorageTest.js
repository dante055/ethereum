const AdvanceStorage = artifacts.require('AdvanceStorage');

contract('Advance Storage Contract Test', () => {
  let advanceStorage;
  beforeEach(async () => {
    // advanceStorage = await AdvanceStorage.deployed();
    advanceStorage = await AdvanceStorage.new();
  });

  it('Should add an element to ids array', async () => {
    await advanceStorage.addId(10);
    const id = await advanceStorage.getId(0);
    assert(id.toNumber() === 10, 'Id does not match');
  });

  it('Should get an element from ids array', async () => {
    await advanceStorage.addId(20);
    const id = await advanceStorage.getId(0);
    assert(id.toNumber() === 20, 'Id does not match');
  });

  it('Should get all element from ids array', async () => {
    await advanceStorage.addId(10);
    await advanceStorage.addId(20);
    const rawIds = await advanceStorage.getAllIds();
    const ids = rawIds.map((id) => id.toNumber());
    assert.deepEqual(ids, [10, 20], 'Ids does not match');
  });

  it('Should return length of the array', async () => {
    await advanceStorage.addId(10);
    await advanceStorage.addId(20);
    const length = await advanceStorage.getLength();
    assert(length.toNumber() === 2, 'Length does not match');
  });
});
