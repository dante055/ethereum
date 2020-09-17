const { ContextReplacementPlugin } = require('webpack');

const AdvanceStorage = artifacts.require('AdvanceStorage');

contract('Advance Storage Contract Trsts', () => {
  let advanceStorage;
  beforeEach(async () => {
    advanceStorage = await AdvanceStorage.new();
  });

  it('Should add an Id to the array', async () => {
    await advanceStorage.addId(5);
    const id = await advanceStorage.getId(0);
    assert(id.toNumber() === 5, 'Ids do not match');
  });

  it('Should get an Id from the array', async () => {
    await advanceStorage.addId(5);
    await advanceStorage.addId(10);
    const id = await advanceStorage.getId(1);
    assert(id.toNumber() === 10, 'Ids do not match');
  });

  it('Should add all Ids from the array', async () => {
    await advanceStorage.addId(5);
    await advanceStorage.addId(10);
    const rawIds = await advanceStorage.getAllIds();
    const ids = rawIds.map((id) => id.toNumber());
    assert.deepEqual(ids, [5, 10], 'Ids do not match');
  });

  it('Should return length of the array', async () => {
    await advanceStorage.addId(5);
    await advanceStorage.addId(10);
    const length = await advanceStorage.getLength();
    assert(length.toNumber() === 2, 'invalid lenght');
  });
});
