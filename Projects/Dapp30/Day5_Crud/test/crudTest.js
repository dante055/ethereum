const { expectRevert } = require('@openzeppelin/test-helpers');
const Crud = artifacts.require('Crud');

contract('Crud Tests', () => {
  let crud;
  beforeEach(async () => {
    crud = await Crud.new();
  });

  it('Shoud create an user', async () => {
    await crud.create('test user');
    const user = await crud.read(1);

    // inside struct the values are of wapped in string so toNumber() cant be use
    // so to use them use returns(uint, string memory) in the read() functions insted of returns(User memory)
    /* 
    assert(
       user[0].toNumber() === 1 && user[1] === 'test user',
       'user does not match'
    );
    */
    assert(user.id === '1' && user.name === 'test user', 'user does not match');
  });

  it('Shoud read an user data', async () => {
    await crud.create('test user');
    const user = await crud.read(1);
    assert.deepEqual(user, ['1', 'test user'], 'user does not match');
  });

  it('Shoud read all user data', async () => {
    await crud.create('test user1');
    await crud.create('test user2');
    const users = await crud.getAllUsers();
    assert.deepEqual(
      users,
      [
        ['1', 'test user1'],
        ['2', 'test user2'],
      ],
      'user does not match'
    );
  });

  it('Shoud update an user', async () => {
    await crud.create('old user');
    const oldUser = await crud.read(1);
    await crud.update(1, 'new user');
    const newUser = await crud.read(1);

    assert(
      oldUser.name === 'old user' && newUser.name === 'new user',
      'update unsuccessfull'
    );
  });

  it('Shoud update an non existing user', async () => {
    await expectRevert(crud.update(1, 'new user'), 'User does not exist');
  });

  it('should delete an id', async () => {
    await crud.create('test user');
    await crud.destroy(1);
    await expectRevert(crud.read(1), 'User does not exist');
  });

  it('Shoud destory an non existing user', async () => {
    await expectRevert(crud.destroy(1), 'User does not exist');
  });
});
