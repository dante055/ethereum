const Dai = artifacts.require('Mocks/Dai.sol');
const Bat = artifacts.require('Mocks/Bat.sol');
const Rep = artifacts.require('Mocks/Rep.sol');
const Zrx = artifacts.require('Mocks/Zrx.sol');
const Dex = artifacts.require('Dex.sol');

// get byte32 of all the tickers
const [DAI, BAT, REP, ZRX] = ['DAI', 'BAT', 'REP', 'ZRX'].map((ticker) =>
  web3.utils.asciiToHex(ticker)
);

// order type (enum has 2 value)
const Side = {
  BUY: 0,
  SELL: 1,
};

module.exports = async function (deployer, _network, accounts) {
  // deployer.deploy(contract, construnctor_argument1, construnctor_argument2)

  // gets traders
  // destructuring , put uderscore to leave the rest
  const [trader1, trader2, trader3, trader4, trader5, _] = accounts;

  // deploy
  await Promise.all(
    [Dai, Bat, Rep, Zrx, Dex].map((contract) => deployer.deploy(contract))
  );

  //interact
  const [dai, bat, rep, zrx, dex] = await Promise.all(
    [Dai, Bat, Rep, Zrx, Dex].map((contract) => contract.deployed())
  );

  // add all token to dex
  await Promise.all([
    dex.addToken(DAI, dai.address), // (bytes32 ticker, tokenAddress)
    dex.addToken(BAT, bat.address),
    dex.addToken(REP, rep.address),
    dex.addToken(ZRX, zrx.address),
  ]);

  // amount minned in token contracts
  const amount = web3.utils.toWei('1200'); // from ether to wei

  // amount of tokens to to deposited in dex account
  const transferAmount = web3.utils.toWei('1000');

  // function to add balance in the mocks faucet
  const seedTokenBalance = async (token, trader) => {
    // create tokens for this addesss
    // faucet only works on development mode not on mainnet
    await token.faucet(trader, amount); // (address to, value)

    // approve token to spend in dex which is define in ERC20.sol
    await token.approve(dex.address, amount, { from: trader }); // (spender, value)

    const ticker = await token.symbol();
    await dex.deposit(web3.utils.asciiToHex(ticker), transferAmount, {
      from: trader,
    });
  };

  // send the balance to mocks
  await Promise.all(
    [dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader1))
  );
  await Promise.all(
    [dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader2))
  );
  await Promise.all(
    [dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader3))
  );
  await Promise.all(
    [dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader4))
  );
  await Promise.all(
    [dai, bat, rep, zrx].map((token) => seedTokenBalance(token, trader5))
  );

  // utility function
  // benifit is that when we see the trade in charts it will be shown in diffrent time
  const increaseTime = async (seconds) => {
    await web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [seconds],
        id: 0,
      },
      () => {}
    );
    await web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: 0,
      },
      () => {}
    );
  };

  //create trades
  await dex.createLimitOrder(BAT, 1000, 10, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(BAT, 1000, Side.SELL, { from: trader2 });
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 1200, 11, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(BAT, 1200, Side.SELL, { from: trader2 });
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 1200, 15, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(BAT, 1200, Side.SELL, { from: trader2 });
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 1500, 14, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(BAT, 1500, Side.SELL, { from: trader2 });
  await increaseTime(1);
  await dex.createLimitOrder(BAT, 2000, 12, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(BAT, 2000, Side.SELL, { from: trader2 });

  await dex.createLimitOrder(REP, 1000, 2, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(REP, 1000, Side.SELL, { from: trader2 });
  await increaseTime(1);
  await dex.createLimitOrder(REP, 500, 4, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(REP, 500, Side.SELL, { from: trader2 });
  await increaseTime(1);
  await dex.createLimitOrder(REP, 800, 2, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(REP, 800, Side.SELL, { from: trader2 });
  await increaseTime(1);
  await dex.createLimitOrder(REP, 1200, 6, Side.BUY, { from: trader1 });
  await dex.createMarketOrder(REP, 1200, Side.SELL, { from: trader2 });

  //create orders
  await Promise.all([
    dex.createLimitOrder(BAT, 1400, 10, Side.BUY, { from: trader1 }),
    dex.createLimitOrder(BAT, 1200, 11, Side.BUY, { from: trader2 }),
    dex.createLimitOrder(BAT, 1000, 12, Side.BUY, { from: trader2 }),

    dex.createLimitOrder(REP, 3000, 4, Side.BUY, { from: trader1 }),
    dex.createLimitOrder(REP, 2000, 5, Side.BUY, { from: trader1 }),
    dex.createLimitOrder(REP, 500, 6, Side.BUY, { from: trader2 }),

    dex.createLimitOrder(ZRX, 4000, 12, Side.BUY, { from: trader1 }),
    dex.createLimitOrder(ZRX, 3000, 13, Side.BUY, { from: trader1 }),
    dex.createLimitOrder(ZRX, 500, 14, Side.BUY, { from: trader2 }),

    dex.createLimitOrder(BAT, 2000, 16, Side.SELL, { from: trader3 }),
    dex.createLimitOrder(BAT, 3000, 15, Side.SELL, { from: trader4 }),
    dex.createLimitOrder(BAT, 500, 14, Side.SELL, { from: trader4 }),

    dex.createLimitOrder(REP, 4000, 10, Side.SELL, { from: trader3 }),
    dex.createLimitOrder(REP, 2000, 9, Side.SELL, { from: trader3 }),
    dex.createLimitOrder(REP, 800, 8, Side.SELL, { from: trader4 }),

    dex.createLimitOrder(ZRX, 1500, 23, Side.SELL, { from: trader3 }),
    dex.createLimitOrder(ZRX, 1200, 22, Side.SELL, { from: trader3 }),
    dex.createLimitOrder(ZRX, 900, 21, Side.SELL, { from: trader4 }),
  ]);
};
