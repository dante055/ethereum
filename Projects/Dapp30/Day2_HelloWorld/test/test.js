const HelloWorld = artifacts.require('HelloWorld');

contract('HelloWorld', () => {
  it('Should be equal to Hello World', async () => {
    const helloWorld = await HelloWorld.deployed();
    const result = await helloWorld.hello();
    assert(result === 'Hello World', 'return string is not equal');
  });
});
