const { expectRevert } = require('@openzeppelin/test-helpers');
const Dai = artifacts.require('Mocks/Dai.sol');
const Bat = artifacts.require('Mocks/Bat.sol');
const Rep = artifacts.require('Mocks/Rep.sol');
const Zrx = artifacts.require('Mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

// order type (limit, market)

// order side (buy, sell) (enum has 2 value)
const Side = {
  BUY: 0,
  SELL: 1,
};

contract('Dex', (accounts) => {
  // contract instances
  let dex, dai, bat, rep, zrx;

  // testing accounts
  const [trader1, trader2] = [accounts[1], accounts[2]];

  // get byte32 of all the tickers
  const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX'].map((ticker) =>
    web3.utils.asciiToHex(ticker)
  );

  beforeEach(async () => {
    // deploy all mocks
    [dai, bat, rep, zrx] = await Promise.all([
      Dai.new(),
      Bat.new(),
      Rep.new(),
      Zrx.new(),
    ]);

    // deploy dex.sol smart contract
    dex = await Dex.new();

    // add all token to dex
    await Promise.all([
      dex.addToken(DAI, dai.address), // (bytes32 ticker, tokenAddress)
      dex.addToken(BAT, bat.address),
      dex.addToken(REP, rep.address),
      dex.addToken(ZRX, zrx.address),
    ]);

    const amount = web3.utils.toWei('1000'); // from ether to wei

    // function to add balance in the mocks faucet
    const seedTokenBalance = async (token, trader) => {
      // create tokens for this addess
      // faucet only works on development mode not on mainnet
      await token.faucet(trader, amount); // (address to, value)

      // approve token to spend in dex which is define in ERC20.sol
      await token.approve(dex.address, amount, { from: trader }); // (spender, value)
    };

    // send the balance to mocks
    await Promise.all(
      [dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader1))
    );
    await Promise.all(
      [dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader2))
    );

    // await dai.approve(dex.address, web3.utils.toWei('1000'), { from: trader1 });
  });

  it('contract successfully deployed', () => {
    assert.ok(dex.address);
    assert.ok(dai.address);
    assert.ok(bat.address);
    assert.ok(rep.address);
    assert.ok(zrx.address);
  });

  it('should deposit tokens', async () => {
    const amount = web3.utils.toWei('100'); // 100 * 10*18 = 10*20 wei  toWei('100', 'ether')
    await dex.deposit(DAI, amount, { from: trader1 });

    const balance = await dex.traderBalances(trader1, DAI); // mapping traderBalances[trader1][DAI]
    assert(balance.toString() === amount, 'deposited amount does not match');
  });

  it('should not deposit more token than that are approved', async () => {
    await dai.faucet(trader1, web3.utils.toWei('1000'));
    // total Dai in minned is 2000
    // approve tokens are 1000
    await expectRevert(
      dex.deposit(DAI, web3.utils.toWei('1001'), { from: trader1 }),
      'transfer amount exceeds allowance'
    );
  });

  it('should not deposit tokens if token does not exist', async () => {
    await expectRevert(
      dex.deposit(
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        web3.utils.toWei('100'),
        { from: trader1 }
      ),
      'Token does not exist'
    );
  });

  it('should not deposit tokens if tokenContract does not have enough tokens', async () => {
    // inital 1000 are present in wallet
    await expectRevert(
      dex.deposit(DAI, web3.utils.toWei('2000'), {
        from: trader1,
      }),
      'Not enough token to transfer'
    );
  });

  it('should withdraw tokens', async () => {
    const amount = web3.utils.toWei('100');
    await dex.deposit(DAI, amount, { from: trader1 });
    await dex.withdraw(DAI, amount, { from: trader1 });

    // balanceOf(address) is a function in ERC20.sol
    const [balanceDex, balanceDai] = await Promise.all([
      dex.traderBalances(trader1, DAI),
      dai.balanceOf(trader1),
    ]);
    assert(balanceDex.isZero());
    assert(balanceDai.toString() === web3.utils.toWei('1000')); // initial balance = 1000
  });

  it('should not withdraw tokens if you dont have enought funds', async () => {
    await expectRevert(
      dex.withdraw(DAI, web3.utils.toWei('100'), { from: trader1 }),
      'Not enough funds to withdraw'
    );
  });

  it('should not withdraw tokens if token does not exist', async () => {
    await expectRevert(
      dex.withdraw(
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        web3.utils.toWei('100'),
        {
          from: trader1,
        }
      ),
      'Token does not exist'
    );
  });

  it('should create limit order and check the sortings of these buy and sell order in orderBook', async () => {
    let daiAmount = web3.utils.toWei('100');
    let tokenAmount = web3.utils.toWei('10');
    let price = 10; // price of one BAT token is 10 DAI
    await dex.deposit(DAI, daiAmount, { from: trader1 });

    await dex.createLimitOrder(BAT, tokenAmount, price, Side.BUY, {
      from: trader1,
    });

    let buyOrders = await dex.getOrders(BAT, Side.BUY);
    let sellOrders = await dex.getOrders(BAT, Side.SELL);

    assert(buyOrders.length === 1, 'buyOrder is empty');
    assert(buyOrders[0].trader === trader1, 'trader address do not match');
    assert(
      buyOrders[0].ticker === web3.utils.padRight(BAT, 64),
      'ticker do not match'
    );
    assert(
      buyOrders[0].amount === tokenAmount,
      'tokens amount does not matced'
    );
    assert(buyOrders[0].price === '10', 'price of order do not match');
    assert(sellOrders.length === 0, 'sell order is not empty');

    // create another limit order and check sorting
    daiAmount = web3.utils.toWei('200');
    price = 11;
    await dex.deposit(DAI, daiAmount, { from: trader2 });

    await dex.createLimitOrder(BAT, tokenAmount, price, Side.BUY, {
      from: trader2,
    });
    buyOrders = await dex.getOrders(BAT, Side.BUY);
    sellOrders = await dex.getOrders(BAT, Side.SELL);

    assert(buyOrders.length === 2, 'length of buy order do not matched');
    assert(buyOrders[0].trader === trader2, 'trader address do not match');
    assert(buyOrders[1].trader === trader1, 'trader address do not match');
    assert(
      buyOrders[0].price === '11' && buyOrders[1].price === '10',
      'order not  sorted properly'
    );

    // again check sorting
    daiAmount = web3.utils.toWei('200');
    price = 9;
    await dex.deposit(DAI, daiAmount, { from: trader1 });

    await dex.createLimitOrder(BAT, tokenAmount, price, Side.BUY, {
      from: trader1,
    });
    buyOrders = await dex.getOrders(BAT, Side.BUY);
    sellOrders = await dex.getOrders(BAT, Side.SELL);

    assert(buyOrders.length === 3, 'length of buy order do not matched');
    assert(buyOrders[0].trader === trader2, 'trader address do not match');
    assert(buyOrders[1].trader === trader1, 'trader address do not match');
    assert(buyOrders[2].trader === trader1, 'trader address do not match');
    assert(
      buyOrders[0].price === '11' &&
        buyOrders[1].price === '10' &&
        buyOrders[2].price === '9',
      'order not  sorted properly'
    );
  });

  // 4 unhappy paths for createLimitOrder
  it('should not create limit order is token does not exist', async () => {
    await expectRevert(
      dex.createLimitOrder(
        web3.utils.asciiToHex('TOKEN-DOES-NOT-EXIST'),
        web3.utils.toWei('10'),
        10,
        Side.BUY,
        { from: trader1 }
      ),
      'Token does not exist'
    );
  });

  it('should not create limit order when ticker is DAI', async () => {
    await expectRevert(
      dex.createLimitOrder(DAI, web3.utils.toWei('10'), '10', Side.BUY, {
        from: trader1,
      }),
      'Cannot trade DAI'
    );
  });

  // max token available for a account currently is 0
  it('should not create limit selling order does not have enough token ', async () => {
    await expectRevert(
      dex.createLimitOrder(REP, web3.utils.toWei('20'), '10', Side.SELL, {
        from: trader1,
      }),
      'Not enough tokens to fufill the order'
    );
  });

  // 1 bat =  100 dai ; 10 bat = 1000 Dai
  // current dia = 100
  it('should not create limit buying order when you dont have enough DAI compete the transaction', async () => {
    expectRevert(
      dex.createLimitOrder(REP, web3.utils.toWei('10'), '100', Side.BUY, {
        from: trader1,
      }),
      'Not enough DAI tokens to buy the order'
    );
  });

  it('should create market order and match with limit order', async () => {
    await dex.deposit(DAI, web3.utils.toWei('100'), { from: trader1 });

    await dex.createLimitOrder(REP, web3.utils.toWei('10'), 10, Side.BUY, {
      from: trader1,
    });

    await dex.deposit(REP, web3.utils.toWei('100'), { from: trader2 });

    await dex.createMarketOrder(REP, web3.utils.toWei('7'), Side.SELL, {
      from: trader2,
    });

    const trader1DaiBalance = await dex.traderBalances(trader1, DAI);
    const trader1RepBalance = await dex.traderBalances(trader1, REP);
    const trader2DaiBalance = await dex.traderBalances(trader2, DAI);
    const trader2RepBalance = await dex.traderBalances(trader2, REP);

    // const balances = await Promise.all([
    //   dex.traderBalances(trader1, DAI),
    //   dex.traderBalances(trader1, REP),
    //   dex.traderBalances(trader2, DAI),
    //   dex.traderBalances(trader2, REP),
    // ]);

    const order = await dex.getOrders(REP, Side.BUY);

    assert(
      order[0].filled === web3.utils.toWei('7'),
      'limit order not partially filled'
    );
    assert(
      trader1DaiBalance.toString() === web3.utils.toWei('30'),
      'balance of DAI for trader1 do not match'
    );
    assert(
      trader1RepBalance.toString() === web3.utils.toWei('7'),
      'balance of REP for trader1 do not match'
    );
    assert(
      trader2DaiBalance.toString() === web3.utils.toWei('70'),
      'balance of DAI for trader2 do not match'
    );
    assert(
      trader2RepBalance.toString() === web3.utils.toWei('93'),
      'balance of REP for trader2 do not match'
    );
  });

  // 4 unhappy path paths for create market order
  it('should NOT create market order if token is DAI', async () => {
    await expectRevert(
      dex.createMarketOrder(DAI, web3.utils.toWei('1000'), Side.BUY, {
        from: trader1,
      }),
      'Cannot trade DAI'
    );
  });

  it('should NOT create market order if token does not not exist', async () => {
    await expectRevert(
      dex.createMarketOrder(
        web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
        web3.utils.toWei('1000'),
        Side.BUY,
        { from: trader1 }
      ),
      'Token does not exist'
    );
  });

  it('should NOT create market order if token balance too low', async () => {
    await expectRevert(
      dex.createMarketOrder(REP, web3.utils.toWei('101'), Side.SELL, {
        from: trader2,
      }),
      'Not enough tokens to fufill the order'
    );
  });

  it('should NOT create market order if dai balance too low', async () => {
    await dex.deposit(REP, web3.utils.toWei('100'), { from: trader1 });

    await dex.createLimitOrder(REP, web3.utils.toWei('100'), 10, Side.SELL, {
      from: trader1,
    });

    await expectRevert(
      dex.createMarketOrder(REP, web3.utils.toWei('101'), Side.BUY, {
        from: trader2,
      }),
      'Not enough DAI to buy tokens'
    );
  });
});
